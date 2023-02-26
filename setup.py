
import os
import sys
import shutil
import subprocess
dir_path = os.path.dirname(os.path.realpath(__file__))
python_version = sys.version
env_exists = os.path.isdir('{}/env'.format(dir_path))
flask_env_exists = os.path.isfile('{}/api/.env'.format(dir_path))
react_env_exists = os.path.isfile('{}/.env'.format(dir_path))
print(env_exists)
print(flask_env_exists)
print(react_env_exists)

# if env_exists:
#     print("Existing directory named env found in project root. Please delete this directory before rerunning setup.py.")
#     sys.exit()
   
if flask_env_exists:
    print("existing flask env file found")
    print('{}/api/.env'.format(dir_path))
    os.system('rm {}/api/.env'.format(dir_path))
    print("flask env removal done", not os.path.isfile('{}/api/.env'.format(dir_path)))

if react_env_exists:
    print("existing react env file found")
    os.system('rm {}/.env'.format(dir_path))
    print("react env removal done", not os.path.isfile('{}/.env'.format(dir_path)))

if python_version.startswith('2'):
    print('Error: please switch to python 3. Current python version used is {}'.format(python_version))
else:
    build_venv_cmd = 'python -m venv env'
    os.system(build_venv_cmd)
    print("env directory created", os.path.isdir('{}/env'.format(dir_path)))
    
    shutil.copy('{}/requirements.txt'.format(dir_path), '{}/env'.format(dir_path))

    install_requirements_cmd = 'cd env; source bin/activate; pip install -r requirements.txt'
    # os.chdir('{}/env'.format(dir_path))
    # os.system('which python')
    # os.system('cd env; source bin/activate; which python')
    # os.system('pwd')
    os.system(install_requirements_cmd)
    # os.chdir(dir_path)
    # os.system('pwd')

    build_flask_dot_env_file = open('{}/api/.env'.format(dir_path), 'x+')
    if build_flask_dot_env_file:
        build_flask_dot_env_file.write("SQLALCHEMY_DATABASE_URI='sqlite:///searches.sqlite3'\n")
        flask_secret_key = input("secret key for SQLALCHEMY: can be anything you would like  ")
        build_flask_dot_env_file.write("SECRET_KEY='{}'".format(flask_secret_key))
        build_flask_dot_env_file.close()

    build_react_dot_env_file = open('{}/.env'.format(dir_path), 'x+')
    if build_react_dot_env_file:
        mapbox_token = input("Enter your mapbox token.  A missingor incorrect token will cause the UI to fail to render. To obtain a key, create a free account with Mapbox.  ")
        build_react_dot_env_file.write("REACT_APP_MAPBOX_ACCESS_TOKEN={}".format(mapbox_token))
        build_react_dot_env_file.close()

    # shutil.copy('{}/wsgi.py'.format(dir_path), '{}/env/wsgi.py'.format(dir_path))

    package_manager = input("Will you be using Yarn or NPM for this project? Please enter Yarn or NPM to continue  ")
    while package_manager.lower() not in ('yarn', 'npm'):
        package_manager = input("Will you be using Yarn or NPM for this project? Please enter Yarn or NPM to continue  ")

    continue_install = input("Are you ready to install dependencies using {}? (y/n)  ".format(package_manager))
    while continue_install.lower() not in ('y', 'n'):
            continue_install = input("Are you ready to install dependencies using {}? (y/n)  ".format(package_manager))

    if continue_install.lower() == 'y':
        if package_manager.lower() == 'yarn':
            os.system('yarn install')
        if package_manager.lower() == 'npm':
            os.system('npm install')

        msg = """
        Use the following terminal commands from the project root directory to run the application:
        npm start     to run the react UI.
        npm run start-api     to run the project backend api
        redis-server     to make a redis server available on localhost - this may require additional installations if you do not have redis available on your machine already.
        """
        print(msg)

    else:
        print('When you are ready, install use your preferred package manager to install react project dependencies listed in package.json')
        msg = """
        After installing react dependencies use the following terminal commands from the project root directory to run the application:
        npm start     to run the react UI.
        npm run start-api     to run the project backend api
        redis-server     to make a redis server available on localhost - this may require additional installations if you do not have redis available on your machine already.
        """
        print(msg)

 