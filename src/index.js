import React, { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import ImageViewer from "react-simple-image-viewer";

const serverUrl = 'https://0fyuj0x77e.execute-api.us-east-1.amazonaws.com'

let images;

function App() {
    const [currentImage, setCurrentImage] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const openImageViewer = useCallback((index) => {
        setCurrentImage(index);
        setIsViewerOpen(true);
    }, []);

    const closeImageViewer = () => {
        setCurrentImage(0);
        setIsViewerOpen(false);
    };

    return (
        <div>
            {images.map((src, index) => (
                <div className="image-block">
                    <img
                        src={src.image}
                        onClick={() => openImageViewer(index)}
                        width="300"
                        key={index}
                        style={{ margin: "10px", border: "solid" }}
                        alt=""
                    />
                    <span class="labels">
                        {src.labels.map(lbl => <p>{lbl}</p>)}
                    </span>
                </div>
            ))}

            {isViewerOpen && (
                <ImageViewer
                    src={images.map(img => img.image)}
                    currentIndex={currentImage}
                    onClose={closeImageViewer}
                    disableScroll={false}
                    backgroundStyle={{
                        backgroundColor: "rgba(0,0,0,0.9)"
                    }}
                    closeOnClickOutside={true}
                />
            )}
        </div>
    );
}

const loadDrawings = async () => {
    const url = serverUrl + '/drawings';

    const getDrawingsRequest = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
        mode: "cors"
    }

    const getDrawingsResponse = await fetch(url, getDrawingsRequest);
    let drawings = await getDrawingsResponse.json();

    // Sort drawings by last update
    drawings.sort((a, b) => (a.updatedAt < b.updatedAt) ? 1 : -1);

    drawings = drawings.filter((drawing)=>drawing.hasOwnProperty('image'));

    let images = drawings.map((drawing) => {
        return {
            image: drawing.hasOwnProperty('image') ? drawing.image.url : null,
            labels: drawing.hasOwnProperty('labels') ? drawing.labels.map((label) => label.Name) : []
        }
    });

    return images;

}

loadDrawings().then((drawings)=> {
    images = drawings;
    const container = document.getElementById("app");
    const root = createRoot(container);
    root.render(<App/>);
});