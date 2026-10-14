from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="arczk-agent",
    version="0.1.2",
    description="Autonomous AI Agent SDK for ArcNano Shielded Zero-Knowledge Nanopayments on Arc",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Trymbak Mahant",
    author_email="trymbakmahant@gmail.com",
    url="https://github.com/Trymbakmahant/arcnano",
    packages=find_packages(),
    package_data={"arczk": ["deposit_bridge.cjs"]},
    include_package_data=True,
    install_requires=[
        "requests>=2.28.0",
        "httpx>=0.24.0",
    ],
    extras_require={
        "langchain": ["langchain-core>=0.1.0"],
        "crewai": ["crewai>=0.1.0"],
    },
    entry_points={
        "console_scripts": [
            "arcnano-mcp=arczk.mcp_server:run_stdio_server",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.9",
)
