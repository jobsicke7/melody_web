from pymongo import MongoClient

# MongoDB 연결
client = MongoClient("mongodb+srv://jobsicke:jslove0619qq@cluster0.thi2x31.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

# 데이터베이스 및 컬렉션 선택
db = client["discord_music_bot"]
collection = db["now_playing"]

# 컬렉션 내 모든 데이터 삭제
collection.delete_many({})

print("모든 데이터가 삭제되었습니다.")
