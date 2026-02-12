# projectC

## Description
A website me and [@Ohello404](https://github.com/Ohello404) developed as a Advanced Python Programming course's final project in AITU (Kazakhstan).
It is a marketplace for selling antiques, souveniers or relics. 

## Installation
The only thing you need to get installed on your Windows is [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/).

After the installation open **Docker Desktop** and login, if you already have an account, or create one.

Next up you will need to clone this repo:
```bash
git clone https://github.com/Kinshikinai/projectC.git
```

## To run locally
You will need to have install these guys:
1. **Node.js**
2. **Python 3.14.x**
3. **pgAdmin 4**
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
*Note:* if you don't want to install these packages on your machine directly, you can do it in python venv
```bash
python -m venv projectCvenv
C:/Users/yourusername/path-to-git-repo/backend/projectCvenv/Scripts/activate.bat
```
5. Starting frontend:
```bash
cd frontend
npm start
```
6. Before starting backend, we need to setup our database.
- Setup pgAdmin4 server
- Open pgAdmin4
- Create your own user or continue with `postgres`
- Go to only `server` you have -> `databases`.
- Left-click and choose `Create` -> `Database` (Alt + Shift + N)
- Name it `porjectC` or any other name
- Left-click on database you just created and choose `Restore`
- In `Format` choose `Plain`
- Select the file located in `backend/app/projectCdb.sql`
- Click restore (choose your user in role, if you created one other than `postgres`)
Starting backend:
```bash
cd backend
uvicorn app.main:app --reload
```
