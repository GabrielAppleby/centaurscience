from dotenv import load_dotenv
from app import application

if __name__ == '__main__':
    load_dotenv('env/.env.dev')
    application.run()
