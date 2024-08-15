
<div align="center">
<img src="https://github.com/sidinsearch/P2PxRelay/blob/main/P2PxRELAY.png" alt="P2PxRelay Logo" width="300"/>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/sidinsearch/P2PxRelay.svg)](https://github.com/sidinsearch/P2PxRelay/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/sidinsearch/P2PxRelay.svg)](https://github.com/sidinsearch/P2PxRelay/issues)

</div>

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [How It Works](#-how-it-works)
- [Security](#-security)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#-usage)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 🚀 About the Project

P2PxRelay is an innovative file-sharing solution that leverages WebRTC technology to enable direct peer-to-peer file transfers. By utilizing a relay server to facilitate connections without storing files, P2PxRelay offers a secure, efficient, and serverless approach to file sharing.

## ⚙️ How It Works

P2PxRelay operates by creating a direct peer-to-peer (P2P) connection between two users using WebRTC. Here's how it works:

1. **File Announcement**: The sender announces the file they want to share using the `p2p.py` client application. This process generates a unique link.
2. **Relay Server**: The relay server, written in Node.js, helps in signaling between the peers. It ensures that both parties are aware of each other and can establish a direct connection.
3. **P2P Connection**: Once the connection is established, the file is transferred directly between the sender and the recipient without passing through the server.
4. **Web Interface**: The recipient opens the provided link in their browser, which triggers the WebRTC connection and initiates the file download.

## 🔐 Security

P2PxRelay emphasizes security by design:

- **No Server-Side Storage**: Unlike traditional file-sharing methods, P2PxRelay does not store files on any server. This reduces the risk of unauthorized access or data breaches.
- **End-to-End Encryption**: WebRTC inherently supports end-to-end encryption (E2EE), ensuring that the file is encrypted during transmission and can only be decrypted by the recipient.
- **Ephemeral Links**: The links generated for file sharing are temporary and expire after use, reducing the risk of unauthorized file access.

These features make P2PxRelay a secure and privacy-conscious choice for file sharing.

## ✨ Features

- 🔒 Secure peer-to-peer file transfer
- 🌐 No server-side file storage
- 🚀 Fast and efficient data transmission
- 🔗 Easy-to-share unique links
- 📱 Cross-platform compatibility

## 🛠 Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **WebRTC**: aiortc (Python)
- **Serverless Functions**: Netlify Functions
- **Networking**: aiohttp (Python)

## 🏁 Getting Started

### Prerequisites

- Python 3.7+
- Node.js 14+
- npm 6+
- A Netlify account

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/sidinsearch/P2PxRelay.git
   ```
2. Install Python dependencies:
   ```sh
   pip install aiortc aiohttp
   ```
3. Install Node.js dependencies:
   ```sh
   cd functions
   npm install
   ```
4. Set up your Netlify site and update the `NETLIFY_SITE` variable in `p2p.py`.

## 🖥️ Usage

1. Start the file sharing process:
   ```sh
   python p2p.py /path/to/your/file
   ```
2. Share the generated link with the recipient.
3. The recipient opens the link in their browser to initiate the download.

## 🏗 Architecture

P2PxRelay consists of three main components:

- **Client Application (`p2p.py`)**: Handles file announcement and WebRTC connection establishment.
- **Relay Server (`relay.js`)**: Facilitates WebRTC signaling and manages shared connections.
- **Web Interface (`index.html`, `download.html`)**: Provides a user-friendly interface for file downloading.

The system uses Netlify for hosting and serverless functions, ensuring scalability and ease of deployment.

## 💻 TransferX: Windows Software

TransferX is a Windows application that utilizes P2PxRelay for seamless file sharing. It offers a user-friendly interface and powerful features, making it easy to share files across devices without the need for server storage.

### Download TransferX
- [Download TransferX for Windows](https://github.com/sidinsearch/TransferX/releases/tag/v1.0)
- [GitHub Repository for TransferX](https://github.com/sidinsearch/TransferX)

## 🎥 TransferX Demo

https://github.com/user-attachments/assets/22da60f3-bbfb-4a33-a82c-7575711634e1

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.


<div align="center">
Made with ❤️ by <a href="https://github.com/sidinsearch" target="_blank">sidinsearch</a>
</div>
