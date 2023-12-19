# [GSB Research Hub Subtheme](https://github.com/SU-SWS/gsb_research_hub_subtheme)
##### Version: 1.0.7

Changelog: [Changelog.txt](CHANGELOG.txt)

Description
---

Research Hub Subtheme is a Stanford sub-theme that works with the Stanford Basic theme.

Documentation
---
See subtheming guides and best practices here: 
https://devguide.sites.stanford.edu/front-end/drupal/sub-themes 

Sites
---
Test: https://gsbresearchhub-test.sites.stanford.edu/

List of Sites with this Subtheme:

- https://researchhub.stanford.edu/ 

- https://gsblibraryd8.sites.stanford.edu/ (pre-production)

- Test site: https://researchhubsubtheme.sites.stanford.edu/

- https://gsbresearchhubintranet.sites.stanford.edu/ (intranet)

Configuration
---

Nothing special needed. Install, enable, and set as the default active theme.

Developer
---

If you wish to develop on this theme you will most likely need to compile some new css. Please use the sass structure provided and compile with the sass compiler packaged in this theme. To install:

```
cd /docroot/themes/custom/gsb_research_hub_subtheme
```

```
nvm use
nvm install
```

Install yarn. 

```
yarn install 
```

```
yarn build
```
This will process scss, js, and asset files, preparing them from the src directory to the dist directory.. yarn build allows the developer to just reload in the Drupal environment. 

```
yarn watch
```
This will watch the scss files and compile them upon saving.

GitPod
---
1. Add your ssh key to [GitPod](https://gitpod.io/variables)
   1. It is recommended to have a password-less ssh key for simplicity.
      1. `ssh-keygen -b 4096`, press enter when asked for the password
      2. Add this ssh public key to the necessary services: Acquia, Github, etc.
   2. Get the base64 string of your ssh key files
      1. `cat id_rsa | base64` for the private key
      2. `cat id_rsa.pub | base64` for the public key.
   3. In GitPod, add the variable named `SSH_PRIVATE_KEY` with the private key
   4. In GitPod, add the variable named `SSH_PUBLIC_KEY` with the public key
   5. In Gitpod, add the variable named `GITCONFIG` with the base64 of your git config: `cat ~/.gitconfig | base64`
2. Recommended, but not required:
   1. install the GitPod browser plugin
   2. Configure your browser settings for an easier experience: https://www.gitpod.io/docs/configure/browser-settings
3. Open a gitpod workspace with [these instructions](https://www.gitpod.io/docs/getting-started#start-your-first-workspace)


Contribution / Collaboration
---

You are welcome to contribute functionality, bug fixes, or documentation to this theme. If you would like to suggest a fix or new functionality you may add a new issue to the GitHub issue queue or you may fork this repository and submit a pull request. For more help please see [GitHub's article on fork, branch, and pull requests](https://help.github.com/articles/using-pull-requests)
