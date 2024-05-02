# GoogleHackathon24-Lighthouse Pro : Lighthouse Enhanced With the Capabilities of Gemini

## Description

Lighthouse Pro is an advanced enhancement tool that leverages Gemini AI capabilities to automate optimization, integrate seamlessly with developer workflows, and elevate Lighthouse reports for peak performance and productivity.

## Table of Contents (Optional)

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [Authors](#authors)
- [Acknowledgments](#acknowledgments)


## Prequisites
You need to have a service-account-key.json file that has the permission to use VertexAI API in the root of the project. You can get it by following the instructions here: https://cloud.google.com/docs/authentication/getting-started


## Installation

First, you need to install node.js through this link https://nodejs.org/en/download
```bash
# Follow those instructions to launch Lighthouse Pro.
git clone https://github.com/nacollard/GoogleHackathon2024-Lighthouse-Pro
cd GoogleHackathon2024-Lighthouse-Pro
npm install
npm run start
```

## Usage
```bash
# Launch Lighthouse Pro with your index.js file & the url of your website.
node index.js <<your_website_url>> <<path_to_codebase>>
```

## Features
1.  **Get a report on the top 5 problems detected by Lighthouse**
2.  **Parse the webpages of Google's advices shared through links in Lighthouse**
3.  **Recieve improvement instructions through the terminal based on your codebase**

**TO COME**
1. **Expanded Lighthouse Pro Functionality**:
   - **Caching for Speed**: Implement a caching mechanism to store and quickly deliver Lighthouse reports, significantly reducing wait times for performance insights.
   - **Cloud Service Integrations**: Build seamless integrations with various cloud services, allowing developers to incorporate Lighthouse Pro into their cloud-based workflows effortlessly.
   - **LLM Prioritization Agent**: Include a language model-based prioritization agent that intelligently assesses and ranks issues based on their potential impact, enabling you to tackle the most critical performance bottlenecks first.

2. **Automated Lighthouse Problem Resolution**:
   - **Code Generation**: Integrate code generation capabilities to automatically propose and apply fixes for issues identified by Lighthouse, streamlining the optimization process.
   - **Recursive Optimization**: Employ a recursive approach to continuously improve the Lighthouse score by iteratively applying optimizations and re-evaluating performance.
   - **CI/CD Integration**: Ensure that Lighthouse Pro is a part of the CI/CD pipeline, automatically running performance checks and optimizations with every code push to maintain high-quality code standards.

3. **Integration with Developer Tools**:
   - **Go Compilation Bug Solver**: Offer tools to automatically detect and resolve bugs in Go language compilations, enhancing the reliability and efficiency of the development process.
   - **Kubernetes Cluster Deployment**: Provide features to facilitate the deployment and management of Kubernetes clusters, simplifying the orchestration of containerized applications.
   - **Google Cloud Cost Optimization**: Include functionality to analyze and optimize costs for projects running on Google Cloud Platform, helping developers to minimize expenses while maximizing resource utilization.

## Contributing
We welcome contributions from the community and are pleased to have you join us. 🚀
If you would like to contribute to Lighthouse Pro, please follow these guidelines:

### Reporting Issues

If you find a bug or have a suggestion for improving Lighthouse Pro, please first check the **issue tracker** to see if someone has already reported it. If not, feel free to open a new issue. When creating an issue, please provide:

- A clear and descriptive title
- A detailed description of the issue or suggestion
- Steps to reproduce the problem, if applicable
- Any relevant code snippets or screenshots

### Submitting Changes

If you'd like to submit a change to Lighthouse Pro, please follow these steps:

1. Fork the repository on GitHub.
2. Clone your fork to your local machine.
3. Create a new branch for your changes.
4. Make your changes in your branch, following the coding standards and documentation style of the project.
5. Add or update tests as necessary for your changes.
6. Run the test suite to ensure that all tests pass.
7. Commit your changes, providing a clear and detailed commit message.
8. Push your changes to your fork on GitHub.
9. Submit a pull request to the main Lighthouse Pro repository, clearly describing the problem you're solving and any relevant issue numbers.

Please note that all contributions to Lighthouse Pro are subject to the project's licensing agreements.


## Authors

Lighthouse Pro was originally created by a dedicated team of developers and AI specialists who participated in the Google AI Hackathon. The core team includes:
- **Eline Nenin** - *Data Scientist*
- **Mathieu Louis** - *AI Lead* - [mlouis00](https://github.com/mlouis00)
- **Nathan Collard** - *AI engineer* - [nacollard](https://github.com/nacollard)
- **Samuel Berton** - *AI engineer* - [samuBe](https://github.com/samuBe)

## Acknowledgments
Special thanks to the open-source community for the tools and libraries that have been essential in the development of this project.
