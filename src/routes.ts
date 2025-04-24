import type { Application } from "express"
import { 
  generateJpgController, 
  generatePNSController, 
  createPNSController, 
  generateImageController, 
  serveUITestController, 
  getJpgController
} from "./controllers";

export function setupRoutes(app: Application): void {
  app.get("/generate-jpg", generateJpgController);
  app.get("/generate-pns", generatePNSController);
  app.post("/create-pns", createPNSController);
  app.get("/generate-image", generateImageController);
  app.get("/get-image", getJpgController);
  app.get("/", serveUITestController);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });
}