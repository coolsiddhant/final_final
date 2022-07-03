import React, { useRef, useState, useEffect, Fragment } from "react";
import { loadLayersModel, browser, squeeze } from "@tensorflow/tfjs";
import Particle from "./component/Particle";
import './App.css';

export default function App() {
  const [model, setModel] = useState(null);
  const fileRef = useRef();
  const canvasRef = useRef();
  const imageRef = useRef();

  useEffect(() => {
    const loadModel = async () => {
      let _model = await loadLayersModel("./model/json/model.json");
      setModel(_model);
      console.log("model loaded successfully");
    };
    loadModel().catch(console.error);
  }, []);

  const handleChange = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      var file = e.target.files[0];
      let reader = new FileReader();
      reader.onload = async () => {
        let canvas = canvasRef.current;
        let image = imageRef.current;
        let dataURL = reader.result;
        image.width = 128;
        image.height = 128;
        image.src = dataURL;
        image.onload = async () => {
          let tensor = browser.fromPixels(image)
            .resizeNearestNeighbor([128, 128])
            .toFloat()
            .expandDims();

          let predictions = model.predict(tensor);
          predictions = squeeze(predictions);
          canvas.width = predictions.shape.width;
          canvas.height = predictions.shape.height;
          await browser.toPixels(predictions, canvas);
        };
      }
      reader.readAsDataURL(file);
    }
  };

  return (
    <Fragment>
      <Particle />
      <div className="upload">
        <h1 style={{ color: "black" }}>Retinal image</h1>
        <button onClick={() => fileRef.current.click()}>
          Upload Image !!!
        </button>
        <div />
        <input
          ref={fileRef}
          onChange={handleChange}
          multiple={false}
          type="file"
          accept="image/x-png,image/gif,image/jpeg"
          hidden
        />
        <img ref={imageRef} />
        <canvas
          ref={canvasRef}
        />
      </div>
    </Fragment>
  );
}