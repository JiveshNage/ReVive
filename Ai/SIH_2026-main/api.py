import io, torch
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from train import SmallCNN
from torchvision import transforms
from pricing import estimate
from recycler_matching import match

ckpt=torch.load("model/ewaste_classifier.pt",map_location="cpu")
classes=ckpt["classes"]; size=ckpt["img_size"]
model=SmallCNN(len(classes)); model.load_state_dict(ckpt["state_dict"]); model.eval()
tf=transforms.Compose([transforms.Resize((size,size)),transforms.ToTensor()])
app=FastAPI(title="E-Waste AI")

@app.get("/health")
def health(): return {"status":"ok","classes":classes}

@app.post("/predict")
async def predict(file:UploadFile=File(...), location:str="Bhopal", weight_kg:float=1.0):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400,"Upload an image.")
    im=Image.open(io.BytesIO(await file.read())).convert("RGB")
    with torch.no_grad():
        p=torch.softmax(model(tf(im).unsqueeze(0)),1)[0]
    idx=int(p.argmax()); category=classes[idx]; confidence=float(p[idx])
    result={"category":category,"confidence":round(confidence,4)}
    result["pricing"]=estimate(category,location,weight_kg)
    result["recycler_matches"]=match(category,location)
    return result
