# p2p.py

import asyncio
import aiohttp
import os
import sys
import json
from aiortc import RTCPeerConnection, RTCSessionDescription

# TODO: Replace with your Netlify site URL
NETLIFY_SITE = "https://your-site-name.netlify.app/.netlify/functions/relay"
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB in bytes

async def create_peer_connection():
    pc = RTCPeerConnection()
    return pc

async def create_offer(pc):
    await pc.setLocalDescription(await pc.createOffer())
    return pc.localDescription

async def set_remote_description(pc, answer):
    await pc.setRemoteDescription(RTCSessionDescription(sdp=answer['sdp'], type=answer['type']))

async def announce_file(file_path):
    file_name = os.path.basename(file_path)
    file_size = os.path.getsize(file_path)
    
    metadata = {
        "fileName": file_name,
        "fileSize": file_size
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(f"{NETLIFY_SITE}/create-share", json={"metadata": metadata}) as response:
            data = await response.json()
            return data["shareId"], data["link"]

async def handle_new_connection(share_id, file_path):
    pc = await create_peer_connection()
    dc = pc.createDataChannel('file_transfer')
    offer = await create_offer(pc)
    
    async with aiohttp.ClientSession() as session:
        async with session.post(f"{NETLIFY_SITE}/add-offer/{share_id}", json={"offer": {"sdp": offer.sdp, "type": offer.type}}) as response:
            data = await response.json()
            connection_id = data["connectionId"]
    
    # Wait for answer
    while True:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{NETLIFY_SITE}/get-answer/{share_id}/{connection_id}") as response:
                if response.status == 200:
                    answer = await response.json()
                    await set_remote_description(pc, answer['answer'])
                    break
                await asyncio.sleep(1)
    
    print(f"New connection established. Connection ID: {connection_id}")
    await send_file(dc, file_path)
    
    # Remove connection after file transfer
    async with aiohttp.ClientSession() as session:
        await session.post(f"{NETLIFY_SITE}/remove-connection/{share_id}/{connection_id}")

async def send_file(dc, file_path):
    print("Waiting for data channel to open...")
    while dc.readyState != "open":
        await asyncio.sleep(0.1)
    print("Data channel opened.")

    with open(file_path, "rb") as file:
        while True:
            data = file.read(16384)
            if not data:
                break
            dc.send(data)
            await asyncio.sleep(0.01)  # Small delay to prevent flooding
    
    dc.send("EOF")
    print("File transfer completed")

async def main():
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = input("Enter the path to the file you want to share: ")
    
    if not os.path.exists(file_path):
        print("File not found. Please check the path and try again.")
        return
    
    file_size = os.path.getsize(file_path)
    if file_size > MAX_FILE_SIZE:
        print(f"File size exceeds the maximum limit of 20MB. Your file is {file_size / (1024 * 1024):.2f}MB.")
        return
    
    share_id, download_link = await announce_file(file_path)
    print(f"File announced successfully. Share ID: {share_id}")
    print(f"Download link: {download_link}")
    print("This link will be valid until you stop the script.")
    
    while True:
        await handle_new_connection(share_id, file_path)

if __name__ == "__main__":
    asyncio.run(main())