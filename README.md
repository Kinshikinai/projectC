# projectC

## Description
A website me and [@Ohello404](https://github.com/Ohello404) developed as a Advanced Python Programming course's final project in AITU (Kazakhstan).
It is a marketplace for selling antiques, souveniers or relics. 

## Installation
The only thing you need to get installed on your Windows is [Docker Desktop](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe?utm_source=docker&utm_medium=webreferral&utm_campaign=docs-driven-download-win-amd64).

After the installation open **Docker Desktop** and login, if you already have an account, or create one.

Next up you will need to clone this repo:
```bash
git clone https://github.com/Kinshikinai/projectC.git
```

## To run locally
You will need to have install these guys:
1. **Node.js**
2. **Python 3.14.x**
Then you need to:
1. Go to folder `frontend`
```bash
cd frontend
```
2. Install all node modules on your machine
```bash
npm i
```
3. Go to folder `backend`
```bash
cd ../backend
```
4. Install all python packages
```bash
pip install -r requirements.txt
```
*Note:* if you don't want to install these packages on your machine directly, yu can do it in python venv
```bash
python -m venv projectCvenv
C:/Users/yourusername/path-to-git-repo/backend/projectCvenv/Scripts/activate.bat
```
