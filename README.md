# WAYNE AI Project Documentation

## 📌 `README.md`

```markdown
# WAYNE AI - Myanmar Language AI Assistant

![WAYNE AI Logo](src/assets/icon.png)

WAYNE AI is a Myanmar-language focused AI assistant powered by Cloudflare Workers AI and Llama 3.1 8B model.

## 🌟 Features

- 💬 Myanmar language chat interface
- 🚀 Powered by Cloudflare Workers AI
- 🌙 Dark/Light mode toggle
- 🔊 Text-to-speech functionality
- ⚙️ Customizable settings

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/Smartburme/wayne-dev.git
```

2. Deploy to Cloudflare Workers:
```bash
npm install -g wrangler
wrangler deploy
```

3. Configure environment variables in `wrangler.toml`

## 🌐 Live Demo

- Web Interface: [GitHub Pages](https://smartburme.github.io/wayne-dev)
- API Endpoint: [https://morning-cell-1282.mysvm.workers.dev](https://morning-cell-1282.mysvm.workers.dev)

## 🏗️ Project Structure

```
wayne-dev/
├── index.html
├── worker.js
├── LICENSE
├── README.md
└── src/
    ├── pages/
    │   ├── main.html
    │   ├── setting.html
    │   └── about.html
    └── assets/
        ├── css/
        │   └── main.css
        ├── js/
        │   └── main.js
        └── icon.png
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📂 Project Files Summary

1. **`README.md`** - Contains:
   - Project description and features
   - Installation instructions
   - Live demo links
   - Project structure
   - License information
   - Contribution guidelines

2. **`LICENSE`** - MIT License file granting permission for use, modification, and distribution

3. **Key Links**:
   - **Live Worker API**: [https://morning-cell-1282.mysvm.workers.dev](https://morning-cell-1282.mysvm.workers.dev)
   - **GitHub Repository**: [github.com/Smartburme/wayne-dev](https://github.com/Smartburme/wayne-dev)
   - **Project Icon**: `src/assets/icon.png`

This documentation provides clear guidance for users and developers while maintaining proper licensing information for your open-source project.
