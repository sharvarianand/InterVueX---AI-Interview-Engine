"""
Project Analyzer - Scrapes and analyzes GitHub + Live URLs

This block:
- Fetches repository structure from GitHub API
- Detects tech stack
- Identifies architecture patterns
- Analyzes README and configs
- Probes live deployment
"""

import httpx
from typing import Optional
import re


class ProjectAnalyzer:
    """Analyzes GitHub repositories and live deployments."""

    def __init__(self):
        self.github_base_url = "https://api.github.com"

    async def analyze(
        self,
        github_url: Optional[str] = None,
        deployment_url: Optional[str] = None,
    ) -> dict:
        """Analyze project from GitHub and/or deployment URL."""
        context = {
            "summary": "",
            "tech_stack": [],
            "architecture": "",
            "features": [],
            "risks": [],
            "readme": "",
            "file_structure": [],
        }

        if github_url:
            github_data = await self._analyze_github(github_url)
            context.update(github_data)

        if deployment_url:
            deployment_data = await self._probe_deployment(deployment_url)
            context["deployment_info"] = deployment_data

        # Generate summary
        context["summary"] = self._generate_summary(context)

        return context

    async def _analyze_github(self, url: str) -> dict:
        """Analyze a GitHub repository."""
        # Extract owner and repo from URL
        match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", url)
        if not match:
            return {"error": "Invalid GitHub URL"}

        owner, repo = match.groups()
        repo = repo.replace(".git", "")

        data = {
            "tech_stack": [],
            "file_structure": [],
            "readme": "",
            "architecture": "",
        }

        async with httpx.AsyncClient() as client:
            try:
                # Get repository info
                repo_response = await client.get(
                    f"{self.github_base_url}/repos/{owner}/{repo}",
                    headers={"Accept": "application/vnd.github.v3+json"},
                    timeout=10.0,
                )
                if repo_response.status_code == 200:
                    repo_info = repo_response.json()
                    data["language"] = repo_info.get("language")
                    data["description"] = repo_info.get("description", "")
                    if repo_info.get("language"):
                        data["tech_stack"].append(repo_info["language"])

                # Get file tree (root level)
                contents_response = await client.get(
                    f"{self.github_base_url}/repos/{owner}/{repo}/contents",
                    headers={"Accept": "application/vnd.github.v3+json"},
                    timeout=10.0,
                )
                if contents_response.status_code == 200:
                    contents = contents_response.json()
                    data["file_structure"] = [
                        {"name": item["name"], "type": item["type"]}
                        for item in contents
                    ]
                    # Detect tech stack from files
                    data["tech_stack"].extend(
                        self._detect_tech_stack(data["file_structure"])
                    )

                # Get README
                readme_response = await client.get(
                    f"{self.github_base_url}/repos/{owner}/{repo}/readme",
                    headers={"Accept": "application/vnd.github.v3+json"},
                    timeout=10.0,
                )
                if readme_response.status_code == 200:
                    import base64
                    readme_data = readme_response.json()
                    content = readme_data.get("content", "")
                    if content:
                        data["readme"] = base64.b64decode(content).decode("utf-8", errors="ignore")[:2000]

            except httpx.RequestError as e:
                data["error"] = str(e)

        # Infer architecture
        data["architecture"] = self._infer_architecture(data["file_structure"])

        return data

    def _detect_tech_stack(self, files: list) -> list:
        """Detect tech stack from file structure."""
        tech_indicators = {
            "package.json": "Node.js/JavaScript",
            "requirements.txt": "Python",
            "Pipfile": "Python",
            "pyproject.toml": "Python",
            "Cargo.toml": "Rust",
            "go.mod": "Go",
            "pom.xml": "Java/Maven",
            "build.gradle": "Java/Gradle",
            "Gemfile": "Ruby",
            "pubspec.yaml": "Flutter/Dart",
            "docker-compose.yml": "Docker",
            "Dockerfile": "Docker",
            ".env": "Environment Config",
            "next.config.js": "Next.js",
            "vite.config.js": "Vite",
            "tailwind.config.js": "Tailwind CSS",
            "tsconfig.json": "TypeScript",
        }

        detected = []
        for file in files:
            name = file.get("name", "")
            if name in tech_indicators:
                detected.append(tech_indicators[name])

        return list(set(detected))

    def _infer_architecture(self, files: list) -> str:
        """Infer project architecture from file structure."""
        file_names = [f.get("name", "").lower() for f in files]

        if "backend" in file_names and "frontend" in file_names:
            return "Monorepo (Frontend + Backend)"
        elif "src" in file_names:
            return "Standard Application Structure"
        elif "app" in file_names:
            return "App-based Structure (possibly Framework)"
        elif "lib" in file_names:
            return "Library/Package Structure"
        else:
            return "Custom/Unknown Structure"

    async def _probe_deployment(self, url: str) -> dict:
        """Probe a live deployment URL."""
        data = {
            "accessible": False,
            "response_time_ms": None,
            "technologies_detected": [],
        }

        async with httpx.AsyncClient() as client:
            try:
                import time
                start = time.time()
                response = await client.get(url, timeout=10.0, follow_redirects=True)
                end = time.time()

                data["accessible"] = response.status_code == 200
                data["response_time_ms"] = round((end - start) * 1000)

                # Basic tech detection from headers
                headers = dict(response.headers)
                if "x-powered-by" in headers:
                    data["technologies_detected"].append(headers["x-powered-by"])
                if "server" in headers:
                    data["technologies_detected"].append(headers["server"])

            except httpx.RequestError as e:
                data["error"] = str(e)

        return data

    def _generate_summary(self, context: dict) -> str:
        """Generate a human-readable project summary."""
        parts = []

        if context.get("description"):
            parts.append(f"Project: {context['description']}")

        if context.get("tech_stack"):
            tech = ", ".join(list(set(context["tech_stack"]))[:5])
            parts.append(f"Tech Stack: {tech}")

        if context.get("architecture"):
            parts.append(f"Architecture: {context['architecture']}")

        if context.get("deployment_info", {}).get("accessible"):
            parts.append("Live deployment is accessible.")

        return " | ".join(parts) if parts else "Project analyzed."
