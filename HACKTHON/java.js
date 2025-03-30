// Function to handle file input and display image
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const imgElement = document.getElementById("uploaded-image");
        imgElement.src = e.target.result;
        imgElement.style.display = 'block';
        analyzeImage(file);
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Function to simulate sending image to back-end for analysis
  function analyzeImage(image) {
    // In a real-world scenario, you would send the image to your back-end for processing here
    // For this example, we'll simulate a response with a timeout
    setTimeout(() => {
      // Mocked analysis result (you would replace this with actual data from your backend)
      const analysisResults = {
        age: 25,
        gender: 'Male',
        emotion: 'Happy',
        landmarks: 'Nose, Eyes, Chin, etc.'
      };
      
      displayResults(analysisResults);
    }, 2000);
  }
  
  // Function to display analysis results on the page
  function displayResults(results) {
    const resultsSection = document.getElementById("results-section");
    const analysisResultsDiv = document.getElementById("analysis-results");
  
    // Clear any previous results
    analysisResultsDiv.innerHTML = '';
  
    const ageElem = document.createElement('p');
    ageElem.textContent = `Estimated Age: ${results.age}`;
    
    const genderElem = document.createElement('p');
    genderElem.textContent = `Gender: ${results.gender}`;
    
    const emotionElem = document.createElement('p');
    emotionElem.textContent = `Emotion: ${results.emotion}`;
    
    const landmarksElem = document.createElement('p');
    landmarksElem.textContent = `Detected Landmarks: ${results.landmarks}`;
  
    // Append the results to the analysis container
    analysisResultsDiv.appendChild(ageElem);
    analysisResultsDiv.appendChild(genderElem);
    analysisResultsDiv.appendChild(emotionElem);
    analysisResultsDiv.appendChild(landmarksElem);
  
    // Show the results section
    resultsSection.classList.remove('hidden');
  }
  // Load models for face-api.js
async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models'); // Load SSD model for face detection
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models'); // Load face landmark model
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models'); // Load face recognition model
  }
  
  // Setup the video stream
  async function setupCamera() {
    const videoElement = document.getElementById('videoElement');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });
    videoElement.srcObject = stream;
  
    videoElement.onloadedmetadata = () => {
      videoElement.play();
      detectEyes(videoElement);
    };
  }
  
  // Detect eyes and facial landmarks
  async function detectEyes(videoElement) {
    const canvas = faceapi.createCanvasFromMedia(videoElement);
    document.body.append(canvas);
    const displaySize = { width: videoElement.width, height: videoElement.height };
    faceapi.matchDimensions(canvas, displaySize);
  
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoElement)
        .withFaceLandmarks(); // Detect face landmarks
  
      if (detections.length > 0) {
        canvas.clear();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        
        // Get eye landmarks
        const landmarks = detections[0].landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
  
        // Calculate the center of the eyes
        const leftEyeCenter = calculateEyeCenter(leftEye);
        const rightEyeCenter = calculateEyeCenter(rightEye);
  
        // Visualize the eye positions on canvas
        drawEyeCenters(canvas, leftEyeCenter, rightEyeCenter);
      }
    }, 100);
  }
  
  // Calculate the center of the eye using the eye landmarks
  function calculateEyeCenter(eyeLandmarks) {
    const x = eyeLandmarks.reduce((sum, point) => sum + point.x, 0) / eyeLandmarks.length;
    const y = eyeLandmarks.reduce((sum, point) => sum + point.y, 0) / eyeLandmarks.length;
    return { x, y };
  }
  
  // Draw eye centers on the canvas
  function drawEyeCenters(canvas, leftEye, rightEye) {
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(leftEye.x, leftEye.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
  
    ctx.beginPath();
    ctx.arc(rightEye.x, rightEye.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
  }
  
  // Initialize the app
  async function init() {
    await loadModels(); // Load face-api.js models
    await setupCamera(); // Start camera feed
  }
  
  init();
  
  