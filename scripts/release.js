// @ts-check
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import minimist from 'minimist'
import pico from 'picocolors'
import semver from 'semver'
import enquirer from 'enquirer'
import { execa } from 'execa'

/**
 * @typedef {{
 *   name: string
 *   version: string
 *   dependencies?: { [dependenciesPackageName: string]: string }
 *   peerDependencies?: { [peerDependenciesPackageName: string]: string }
 * }} Package
 */

let versionUpdated = false

const { prompt } = enquirer
const packageJson = createRequire(import.meta.url)('../package.json')
const currentVersion = packageJson.version
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const args = minimist(process.argv.slice(2), {
    alias: {
        skipBuild: 'skip-build',
        skipTests: 'skip-tests',
        skipGit: 'skip-git',
        skipPrompts: 'skip-prompts'
    }
})

const preId = args.preid || semver.prerelease(currentVersion)?.[0]
const isDryRun = args.dry
/** @type {boolean | undefined} */
let skipTests = args.skipTests
const skipBuild = args.skipBuild
const skipPrompts = args.skipPrompts
const skipGit = args.skipGit

const keepThePackageName = (/** @type {string} */ pkgName) => pkgName

/** @type {ReadonlyArray<import('semver').ReleaseType>} */
const versionIncrements = [
    'patch',
    'minor',
    'major',
    ...(preId
        ? /** @type {const} */ ([
              'prepatch',
              'preminor',
              'premajor',
              'prerelease'
          ])
        : [])
]

const inc = (/** @type {import('semver').ReleaseType} */ i) =>
    semver.inc(currentVersion, i, preId)
const run = async (
    /** @type {string} */ bin,
    /** @type {ReadonlyArray<string>} */ args,
    /** @type {import('execa').Options} */ opts = {}
) => execa(bin, args, { stdio: 'inherit', ...opts })
const dryRun = async (
    /** @type {string} */ bin,
    /** @type {ReadonlyArray<string>} */ args,
    /** @type {import('execa').Options} */ opts = {}
) => console.log(pico.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)
const runIfNotDry = isDryRun ? dryRun : run
const step = (/** @type {string} */ msg) => console.log(pico.cyan(msg))

async function main() {
    let targetVersion = args._[0]

    if (!targetVersion) {
        // no explicit version, offer suggestions
        /** @type {{ release: string }} */
        const { release } = await prompt({
            type: 'select',
            name: 'release',
            message: 'Select release type',
            choices: versionIncrements
                .map((i) => `${i} (${inc(i)})`)
                .concat(['custom'])
        })

        if (release === 'custom') {
            /** @type {{ version: string }} */
            const result = await prompt({
                type: 'input',
                name: 'version',
                message: 'Input custom version',
                initial: currentVersion
            })
            targetVersion = result.version
        } else {
            targetVersion = release.match(/\((.*)\)/)?.[1] ?? ''
        }
    }

    if (!semver.valid(targetVersion)) {
        throw new Error(`invalid target version: ${targetVersion}`)
    }

    if (skipPrompts) {
        step(`Releasing v${targetVersion}...`)
    } else {
        /** @type {{ yes: boolean }} */
        const { yes: confirmRelease } = await prompt({
            type: 'confirm',
            name: 'yes',
            message: `Releasing v${targetVersion}. Confirm?`
        })

        if (!confirmRelease) {
            return
        }
    }

    if (!skipTests) {
        step('\nRunning tests...')
        if (!isDryRun) {
            await run('pnpm', ['run', 'test'])
        } else {
            console.log(`Skipped (dry run)`)
        }
    } else {
        step('Tests skipped.')
    }

    // update all package versions and inter-dependencies
    step('\nUpdating cross dependencies...')
    updateVersions(targetVersion, keepThePackageName)
    versionUpdated = true

    // build all packages with types
    step('\nBuilding all packages...')
    if (!skipBuild && !isDryRun) {
        await run('pnpm', ['run', 'build', '--withTypes'])
    } else {
        console.log(`(skipped)`)
    }

    // generate changelog
    step('\nGenerating changelog...')
    await run(`pnpm`, ['run', 'changelog'])

    if (!skipPrompts) {
        /** @type {{ yes: boolean }} */
        const { yes: changelogOk } = await prompt({
            type: 'confirm',
            name: 'yes',
            message: `Changelog generated. Does it look good?`
        })

        if (!changelogOk) {
            return
        }
    }

    if (!skipGit) {
        const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
        if (stdout) {
            step('\nCommitting changes...')
            await runIfNotDry('git', ['add', '-A'])
            await runIfNotDry('git', [
                'commit',
                '-m',
                `release: v${targetVersion} :tada:`
            ])
        } else {
            console.log('No changes to commit.')
        }
    }

    // publish packages
    step('\nPublishing packages...')

    const additionalPublishFlags = []
    if (isDryRun) {
        additionalPublishFlags.push('--dry-run')
    }
    if (skipGit || isDryRun) {
        additionalPublishFlags.push('--no-git-checks')
    }

    // publishPackage(packageJson.name, targetVersion, additionalPublishFlags)

    // push to GitHub
    if (!skipGit) {
        step('\nPushing to GitHub...')
        await runIfNotDry('git', ['tag', `v${targetVersion}`])
        await runIfNotDry('git', [
            'push',
            'origin',
            `refs/tags/v${targetVersion}`
        ])
        await runIfNotDry('git', ['push'])
    }

    if (isDryRun) {
        console.log(`\nDry run finished - run git diff to see package changes.`)
    }

    console.log()
}

/**
 * @param {string} version
 * @param {(pkgName: string) => string} getNewPackageName
 */
function updateVersions(version, getNewPackageName = keepThePackageName) {
    const pkgRoot = path.resolve(__dirname, '..')
    const pkgPath = path.resolve(pkgRoot, 'package.json')
    /** @type {Package} */
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name = getNewPackageName(pkg.name)
    pkg.version = version
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

/**
 * @param {string} pkgName
 * @param {string} version
 * @param {ReadonlyArray<string>} additionalFlags
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function publishPackage(pkgName, version, additionalFlags) {
    let releaseTag = null
    if (args.tag) {
        releaseTag = args.tag
    } else if (version.includes('alpha')) {
        releaseTag = 'alpha'
    } else if (version.includes('beta')) {
        releaseTag = 'beta'
    } else if (version.includes('rc')) {
        releaseTag = 'rc'
    }

    step(`Publishing ${pkgName}...`)
    try {
        // Don't change the package manager here as we rely on pnpm to handle
        // workspace:* deps
        await run(
            'pnpm',
            [
                'publish',
                ...(releaseTag ? ['--tag', releaseTag] : []),
                '--access public',
                ...additionalFlags
            ],
            {
                cwd: path.resolve(__dirname, '..'),
                stdio: 'pipe'
            }
        )
        console.log(pico.green(`Successfully published ${pkgName}@${version}`))
    } catch (/** @type {any} */ e) {
        if (e.stderr.match(/previously published/)) {
            console.log(pico.red(`Skipping already published: ${pkgName}`))
        } else {
            throw e
        }
    }
}

main().catch((err) => {
    if (versionUpdated) {
        // revert to current version on failed releases
        updateVersions(currentVersion)
    }
    console.error(err)
    process.exit(1)
})
