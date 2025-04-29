let numbers = [];
let hourSquiggle = [];
let minuteSquiggle = [];
let secondSquiggle = [];
let squiggleLength;
let noiseOffset = 0;
let rotationAngle = 0;
let minSpacing = 50;
let lastSecond = -1;
let targetSizes = new Array(60).fill(0);
let currentSizes = new Array(60).fill(0);
let clockMode;
let centerPoint;
let is24HourMode;
// Add variables to track current and target positions
let currentHourTarget = { x: 0, y: 0 };
let currentMinuteTarget = { x: 0, y: 0 };
let currentSecondTarget = { x: 0, y: 0 };
// Add variables to track the current orbit centers
let currentHourOrbit = { x: 0, y: 0 };
let currentMinuteOrbit = { x: 0, y: 0 };
let currentSecondOrbit = { x: 0, y: 0 };
// Add background pattern variables
let backgroundPattern;
let patternAngle = 0;
let patternNoiseOffset = 0;
// Add variable for stripe angle
let stripeAngle;
// Add variable for gradient background
let hasGradientBackground = false;
// Add variables for number size transitions
let hourTargetSize = 150;
let minuteTargetSize = 75;
let secondTargetSize = 50;
let currentHourSize = 150;
let currentMinuteSize = 75;
let currentSecondSize = 50;
// Add variables for radial mode number sizes
let radialHourTargetSize = 150;
let radialMinuteTargetSize = 75;
let radialSecondTargetSize = 50;
let currentRadialHourSize = 150;
let currentRadialMinuteSize = 75;
let currentRadialSecondSize = 50;
// Add variables for number colors
let hourFillColor = [255, 0, 0];
let hourStrokeColor = [255, 0, 0];
let minuteFillColor = [0, 255, 0];
let minuteStrokeColor = [0, 255, 0];
let secondFillColor = [0, 0, 255];
let secondStrokeColor = [0, 0, 255];
// Add string mode variables
let stringModePoints = {
    hour: [],
    minute: [],
    second: []
};

function drawBackground() {
    background(240); // Base background color
    
    // Draw gradient background if enabled
    if (hasGradientBackground) {
        noStroke();
        switch(backgroundPattern) {
            case 0: // Concentric gradient - optimized
                let maxRadius = max(width, height) * 0.6;
                let numSteps = 50; // Increased steps for smoother gradient
                let centerColor = color(20, 20, 255);
                let outerColor = color(255, 200, 100);
                
                // Create gradient by drawing semi-transparent circles
                for (let i = numSteps; i >= 0; i--) {
                    let r = map(i, 0, numSteps, 0, maxRadius);
                    let inter = map(i, 0, numSteps, 0, 1);
                    let c = lerpColor(centerColor, outerColor, inter);
                    let alpha = map(i, 0, numSteps, 255, 0); // Fade out towards edges
                    fill(red(c), green(c), blue(c), alpha);
                    ellipse(width/2, height/2, r * 2, r * 2);
                }
                break;
                
            case 1: // Grid gradient
                let gridSize = 40;
                for (let x = 0; x < width; x += gridSize) {
                    for (let y = 0; y < height; y += gridSize) {
                        let interX = map(x, 0, width, 0, 1);
                        let interY = map(y, 0, height, 0, 1);
                        let c = lerpColor(
                            lerpColor(color(200, 255, 200), color(200, 200, 255), interX),
                            lerpColor(color(255, 200, 200), color(255, 255, 200), interX),
                            interY
                        );
                        fill(c);
                        rect(x, y, gridSize, gridSize);
                    }
                }
                break;
                
            case 2: // Diagonal gradient
                push();
                translate(width/2, height/2);
                rotate(stripeAngle);
                
                // Calculate the maximum distance needed to cover the screen
                let maxDist = dist(0, 0, width, height);
                let gradientSteps = 50; // Renamed from numSteps to avoid conflict
                
                // Draw overlapping rectangles to create gradient
                for (let i = 0; i < gradientSteps; i++) {
                    let inter = map(i, 0, gradientSteps, 0, 1);
                    let c = lerpColor(color(20, 20, 255), color(255, 200, 100), inter);
                    let alpha = map(i, 0, gradientSteps, 255, 0);
                    
                    // Calculate rectangle dimensions
                    let w = maxDist * 2;
                    let h = maxDist / gradientSteps * 2;
                    let y = map(i, 0, gradientSteps, -maxDist, maxDist);
                    
                    fill(red(c), green(c), blue(c), alpha);
                    rect(-w/2, y - h/2, w, h);
                }
                pop();
                break;
                
            case 3: // Wave gradient
                let waveSpacing = 20;
                for (let y = 0; y < height; y += waveSpacing) {
                    let inter = map(y, 0, height, 0, 1);
                    let c = lerpColor(color(200, 255, 200), color(200, 200, 255), inter);
                    fill(c);
                    beginShape();
                    vertex(0, y);
                    for (let x = 0; x < width; x += 5) {
                        let noiseVal = noise(x * 0.01, y * 0.01, patternNoiseOffset);
                        let offset = map(noiseVal, 0, 1, -10, 10);
                        vertex(x, y + offset);
                    }
                    vertex(width, y);
                    vertex(width, y + waveSpacing);
                    for (let x = width; x > 0; x -= 5) {
                        let noiseVal = noise(x * 0.01, y * 0.01, patternNoiseOffset);
                        let offset = map(noiseVal, 0, 1, -10, 10);
                        vertex(x, y + waveSpacing + offset);
                    }
                    vertex(0, y + waveSpacing);
                    endShape(CLOSE);
                }
                patternNoiseOffset += 0.01;
                break;
        }
    }
    
    // Draw the main pattern
    switch(backgroundPattern) {
        case 0: // Concentric circles
            noFill();
            stroke(220, 220, 220, 255);
            strokeWeight(10);
            let spacing = 50;
            for (let r = spacing; r < max(width, height); r += spacing) {
                ellipse(width/2, height/2, r * 2, r * 2);
            }
            break;
            
        case 1: // Simple grid
            stroke(220, 220, 220, 250);
            strokeWeight(10);
            let gridSize = 40;
            for (let x = 0; x < width; x += gridSize) {
                for (let y = 0; y < height; y += gridSize) {
                    ellipse(x, y, 5, 5);
                }
            }
            break;
            
        case 2: // Diagonal stripes
            stroke(220, 220, 220, 250);
            strokeWeight(10);
            let stripeSpacing = 30;
            
            // Calculate the maximum distance needed to cover the screen
            let maxDist = dist(0, 0, width, height);
            
            // Calculate the number of stripes needed to cover the screen
            let numStripes = ceil(maxDist / stripeSpacing) * 2;
            
            // Center point for the stripes
            let centerX = width/2;
            let centerY = height/2;
            
            // Draw stripes at the random angle
            for (let i = -numStripes/2; i < numStripes/2; i++) {
                let distance = i * stripeSpacing;
                let x1 = centerX + cos(stripeAngle) * distance;
                let y1 = centerY + sin(stripeAngle) * distance;
                let x2 = x1 + cos(stripeAngle + HALF_PI) * maxDist;
                let y2 = y1 + sin(stripeAngle + HALF_PI) * maxDist;
                let x3 = x1 - cos(stripeAngle + HALF_PI) * maxDist;
                let y3 = y1 - sin(stripeAngle + HALF_PI) * maxDist;
                line(x2, y2, x3, y3);
            }
            break;
            
        case 3: // Organic waves
            noFill();
            stroke(220, 220, 220, 250);
            strokeWeight(1);
            let waveSpacing = 20;
            for (let y = 0; y < height; y += waveSpacing) {
                beginShape();
                for (let x = 0; x < width; x += 5) {
                    let noiseVal = noise(x * 0.01, y * 0.01, patternNoiseOffset);
                    let offset = map(noiseVal, 0, 1, -10, 10);
                    vertex(x, y + offset);
                }
                endShape();
            }
            patternNoiseOffset += 0.01;
            break;
    }
}

function setup() {
    console.log("Setting up...");
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    
    // Initialize mode and center point
    clockMode = random() < 0.5 ? 'circular' : 'radial';
    if (random() < 0.25) {
        clockMode = 'string'; // 25% chance of string mode
    }
    is24HourMode = random() < 0.25;
    
    // Randomly select a background pattern
    backgroundPattern = floor(random(4));
    console.log("Selected background pattern:", backgroundPattern);
    
    // 20% chance of having a gradient background
    hasGradientBackground = random() < 0.2;
    console.log("Has gradient background:", hasGradientBackground);
    
    // Initialize random stripe angle if that pattern is selected
    if (backgroundPattern === 2) {
        stripeAngle = random(TWO_PI);
        console.log("Stripe angle:", degrees(stripeAngle));
    }
    
    // For radial mode, place center point in middle 3/5ths of screen
    if (clockMode === 'radial') {
        let centerX = random(width * 0.2, width * 0.8);
        let centerY = random(height * 0.2, height * 0.8);
        centerPoint = createVector(centerX, centerY);
    } else {
        centerPoint = createVector(width/2, height/2);
    }
    
    // Set squiggle length based on mode
    if (clockMode === 'circular') {
        // Randomly choose between 30, 45, 60, or 120
        let possibleLengths = [30, 45, 60, 120];
        squiggleLength = random(possibleLengths);
    } else {
        squiggleLength = 30; // Default length for radial mode
    }
    
    // Initialize number positions with random scattering
    numbers = [];
    let maxNumbers = is24HourMode ? 24 : 12;
    for (let i = 0; i < maxNumbers; i++) {
        numbers.push({
            value: i,
            x: random(width * 0.1, width * 0.9),
            y: random(height * 0.1, height * 0.9)
        });
    }
    
    // Add minute positions (always 0-59)
    for (let i = 0; i < 60; i++) {
        if (i >= maxNumbers) { // Skip if already added as hour
            numbers.push({
                value: i,
                x: random(width * 0.1, width * 0.9),
                y: random(height * 0.1, height * 0.9)
            });
        }
    }
    
    // Initialize string mode points
    if (clockMode === 'string') {
        initializeStringMode();
    }
    
    // Initialize current positions
    let currentHour = is24HourMode ? hour() : hour() % 12;
    let currentMinute = minute();
    let currentSecond = second();
    
    let hourNum = numbers.find(n => n.value === currentHour);
    let minuteNum = numbers.find(n => n.value === currentMinute);
    let secondNum = numbers.find(n => n.value === currentSecond);
    
    if (hourNum) {
        currentHourTarget.x = hourNum.x;
        currentHourTarget.y = hourNum.y;
        currentHourOrbit.x = hourNum.x;
        currentHourOrbit.y = hourNum.y;
    }
    if (minuteNum) {
        currentMinuteTarget.x = minuteNum.x;
        currentMinuteTarget.y = minuteNum.y;
        currentMinuteOrbit.x = minuteNum.x;
        currentMinuteOrbit.y = minuteNum.y;
    }
    if (secondNum) {
        currentSecondTarget.x = secondNum.x;
        currentSecondTarget.y = secondNum.y;
        currentSecondOrbit.x = secondNum.x;
        currentSecondOrbit.y = secondNum.y;
    }
    
    initializeSquiggles();
    
    console.log("Setup complete. Mode:", clockMode, "24-hour:", is24HourMode, "Squiggle Length:", squiggleLength);
}

function initializeSquiggles() {
    hourSquiggle = [];
    minuteSquiggle = [];
    secondSquiggle = [];
    
    for (let i = 0; i < squiggleLength; i++) {
        if (clockMode === 'radial') {
            hourSquiggle.push(createVector(centerPoint.x, centerPoint.y));
            minuteSquiggle.push(createVector(centerPoint.x, centerPoint.y));
            secondSquiggle.push(createVector(centerPoint.x, centerPoint.y));
        } else {
            hourSquiggle.push(createVector(random(width), random(height)));
            minuteSquiggle.push(createVector(random(width), random(height)));
            secondSquiggle.push(createVector(random(width), random(height)));
        }
    }
}

function initializeStringMode() {
    // Sort numbers by value to ensure proper connection order
    let sortedNumbers = [...numbers].sort((a, b) => a.value - b.value);
    
    // Initialize points for each hand
    stringModePoints.hour = sortedNumbers.filter(n => n.value < (is24HourMode ? 24 : 12));
    stringModePoints.minute = sortedNumbers.filter(n => n.value < 60);
    stringModePoints.second = sortedNumbers.filter(n => n.value < 60);
}

function drawStringPath(points, currentValue, col) {
    if (points.length === 0) return;
    
    noFill();
    stroke(col);
    // Set stroke weight based on color (red=hour, green=minute, blue=second)
    if (red(col) > 0) { // Red = hour
        strokeWeight(24);
    } else if (green(col) > 0) { // Green = minute
        strokeWeight(12);
    } else { // Blue = second
        strokeWeight(6);
    }
    
    beginShape();
    // Draw from 0 to current value
    for (let i = 0; i <= currentValue; i++) {
        let point = points[i];
        if (point) {
            vertex(point.x, point.y);
        }
    }
    endShape();
    
    // Draw circle at current value
    let currentPoint = points[currentValue];
    if (currentPoint) {
        fill(col);
        noStroke();
        let circleSize = col === color(255, 0, 0) ? 150 : 
                        col === color(0, 255, 0) ? 75 : 45;
        ellipse(currentPoint.x, currentPoint.y, circleSize * 2);
    }
}

function draw() {
    drawBackground();
    
    rotationAngle += 0.02;
    
    // Get current time values
    let currentHour = is24HourMode ? hour() : hour() % 12;
    let currentMinute = minute();
    let currentSecond = second();
    
    if (clockMode === 'string') {
        // Draw hour string (red)
        drawStringPath(stringModePoints.hour, currentHour, color(255, 0, 0, 150));
        
        // Draw minute string (green)
        drawStringPath(stringModePoints.minute, currentMinute, color(0, 255, 0, 150));
        
        // Draw second string (blue)
        drawStringPath(stringModePoints.second, currentSecond, color(0, 0, 255, 150));
        
        // Draw all numbers
        numbers.forEach(num => {
            let isValidHour = is24HourMode ? num.value < 24 : num.value < 12;
            let isValidMinute = num.value >= 0 && num.value < 60;
            
            if (isValidHour || isValidMinute) {
                textAlign(CENTER, CENTER);
                textSize(25);
                noStroke();
                fill(0);
                text(num.value, num.x, num.y);
            }
        });
    } else {
        // Update target sizes based on current second
        if (currentSecond !== lastSecond) {
            for (let i = 0; i < 60; i++) {
                let diff = abs(i - currentSecond);
                targetSizes[i] = 2 * (25 / (diff + 1));
            }
            lastSecond = currentSecond;
        }
        
        // Smoothly update current sizes
        for (let i = 0; i < 60; i++) {
            currentSizes[i] = lerp(currentSizes[i], targetSizes[i], 0.1);
        }
        
        // Update squiggles
        updateSquiggles();
        
        // Draw in layers from bottom to top
        if (clockMode === 'radial') {
            // First layer: Hour hand with reduced opacity
            drawSquiggle(hourSquiggle, color(255, 0, 0, 255), currentHour);
            
            // Second layer: Minute hand with reduced opacity
            drawSquiggle(minuteSquiggle, color(0, 255, 0, 255), currentMinute);
            
            // Third layer: Second hand with reduced opacity
            drawSquiggle(secondSquiggle, color(0, 0, 255, 255), currentSecond);

            // Draw all non-selected numbers in black first
            numbers.forEach(num => {
                // Only draw numbers that are valid for the current mode
                let isValidHour = is24HourMode ? num.value < 24 : num.value < 12;
                let isValidMinute = num.value >= 0 && num.value < 60;
                
                if ((isValidHour || isValidMinute) && 
                    num.value !== currentHour && 
                    num.value !== currentMinute && 
                    num.value !== currentSecond) {
                    textAlign(CENTER, CENTER);
                    textSize(currentSizes[num.value]);
                    noStroke();
                    fill(0);
                    text(num.value, num.x, num.y);
                }
            });
            
            // Update target sizes for overlapping numbers in radial mode
            let hourNum = numbers.find(n => n.value === currentHour);
            let minuteNum = numbers.find(n => n.value === currentMinute);
            let secondNum = numbers.find(n => n.value === currentSecond);
            
            // Reset target sizes
            hourTargetSize = 150;
            minuteTargetSize = 75;
            secondTargetSize = 50;

            // Reset colors
            hourFillColor = [255, 255, 255];
            hourStrokeColor = [255, 255, 255];
            minuteFillColor = [255, 255, 255];
            minuteStrokeColor = [255, 255, 255];
            secondFillColor = [255, 255, 255];
            secondStrokeColor = [255, 255, 255];
            
            // Handle overlaps
            if (hourNum && minuteNum && hourNum.value === minuteNum.value) {
                hourTargetSize = 75;
                hourFillColor = [255, 255, 255];
                hourStrokeColor = [255, 0, 0];
            }
            if (hourNum && secondNum && hourNum.value === secondNum.value) {
                hourTargetSize = 50;
                hourFillColor = [255, 255, 255];
                hourStrokeColor = [255, 0, 0];
            }
            if (minuteNum && secondNum && minuteNum.value === secondNum.value) {
                minuteTargetSize = 50;
                minuteFillColor = [255, 255, 255];
                minuteStrokeColor = [0, 255, 0];
            }
            
            // Smoothly update current sizes
            currentHourSize = lerp(currentHourSize, hourTargetSize, 0.1);
            currentMinuteSize = lerp(currentMinuteSize, minuteTargetSize, 0.1);
            currentSecondSize = lerp(currentSecondSize, secondTargetSize, 0.1);
            
            // Draw selected numbers with smooth transitions
            numbers.forEach(num => {
                let isHour = num.value === currentHour;
                let isMinute = num.value === currentMinute;
                let isSecond = num.value === currentSecond;
                
                // Only draw if it's a valid number for the current mode
                let isValidHour = is24HourMode ? num.value < 24 : num.value < 12;
                let isValidMinute = num.value >= 0 && num.value < 60;
                
                if ((isValidHour || isValidMinute) && (isHour || isMinute || isSecond)) {
                    textAlign(CENTER, CENTER);
                    
                    // Count how many hands are targeting this number
                    let handCount = (isHour ? 1 : 0) + (isMinute ? 1 : 0) + (isSecond ? 1 : 0);
                    
                    if (isHour) {
                        textSize(currentHourSize);
                        stroke(hourStrokeColor[0], hourStrokeColor[1], hourStrokeColor[2]);
                        strokeWeight(handCount >= 2 ? 10 : 2);
                        fill(hourFillColor[0], hourFillColor[1], hourFillColor[2]);
                    } else if (isMinute) {
                        textSize(currentMinuteSize);
                        stroke(minuteStrokeColor[0], minuteStrokeColor[1], minuteStrokeColor[2]);
                        strokeWeight(handCount >= 2 ? 10 : 2);
                        fill(minuteFillColor[0], minuteFillColor[1], minuteFillColor[2]);
                    } else if (isSecond) {
                        textSize(currentSecondSize);
                        stroke(secondStrokeColor[0], secondStrokeColor[1], secondStrokeColor[2]);
                        strokeWeight(handCount >= 2 ? 10 : 2);
                        fill(secondFillColor[0], secondFillColor[1], secondFillColor[2]);
                    }
                    
                    text(num.value, num.x, num.y);
                }
            });
        } else {
            // Circular mode
            drawSquiggle(hourSquiggle, color(255, 0, 0, 200), currentHour);
            drawSquiggle(minuteSquiggle, color(0, 255, 0, 200), currentMinute);
            drawSquiggle(secondSquiggle, color(0, 0, 255, 200), currentSecond);
            
            // Draw all non-selected numbers in black first
            numbers.forEach(num => {
                let isValidHour = is24HourMode ? num.value < 24 : num.value < 12;
                let isValidMinute = num.value >= 0 && num.value < 60;
                
                if ((isValidHour || isValidMinute) && 
                    num.value !== currentHour && 
                    num.value !== currentMinute && 
                    num.value !== currentSecond) {
                    textAlign(CENTER, CENTER);
                    textSize(currentSizes[num.value]);
                    noStroke();
                    fill(0);
                    text(num.value, num.x, num.y);
                }
            });
            
            // Update target sizes and colors for overlapping numbers
            let hourNum = numbers.find(n => n.value === currentHour);
            let minuteNum = numbers.find(n => n.value === currentMinute);
            let secondNum = numbers.find(n => n.value === currentSecond);
            
            // Reset target sizes
            hourTargetSize = 150;
            minuteTargetSize = 75;
            secondTargetSize = 50;
            
            // Reset colors
            hourFillColor = [255, 0, 0];
            hourStrokeColor = [255, 0, 0];
            minuteFillColor = [0, 255, 0];
            minuteStrokeColor = [0, 255, 0];
            secondFillColor = [0, 0, 255];
            secondStrokeColor = [0, 0, 255];
            
            // Handle overlaps
            if (hourNum && minuteNum && hourNum.value === minuteNum.value) {
                hourTargetSize = 75;
                hourFillColor = [0, 255, 0];
                hourStrokeColor = [255, 0, 0];
            }
            if (hourNum && secondNum && hourNum.value === secondNum.value) {
                hourTargetSize = 50;
                hourFillColor = [0, 0, 255];
                hourStrokeColor = [255, 0, 0];
            }
            if (minuteNum && secondNum && minuteNum.value === secondNum.value) {
                minuteTargetSize = 50;
                minuteFillColor = [0, 0, 255];
                minuteStrokeColor = [0, 255, 0];
            }
            
            // Smoothly update current sizes
            currentHourSize = lerp(currentHourSize, hourTargetSize, 0.1);
            currentMinuteSize = lerp(currentMinuteSize, minuteTargetSize, 0.1);
            currentSecondSize = lerp(currentSecondSize, secondTargetSize, 0.1);
            
            // Draw selected numbers with smooth transitions
            numbers.forEach(num => {
                let isHour = num.value === currentHour;
                let isMinute = num.value === currentMinute;
                let isSecond = num.value === currentSecond;
                
                // Only draw if it's a valid number for the current mode
                let isValidHour = is24HourMode ? num.value < 24 : num.value < 12;
                let isValidMinute = num.value >= 0 && num.value < 60;
                
                if ((isValidHour || isValidMinute) && (isHour || isMinute || isSecond)) {
                    textAlign(CENTER, CENTER);
                    
                    // Count how many hands are targeting this number
                    let handCount = (isHour ? 1 : 0) + (isMinute ? 1 : 0) + (isSecond ? 1 : 0);
                    
                    if (isHour) {
                        textSize(currentHourSize);
                        stroke(hourStrokeColor[0], hourStrokeColor[1], hourStrokeColor[2]);
                        strokeWeight(handCount >= 2 ? 10 : 2);
                        fill(hourFillColor[0], hourFillColor[1], hourFillColor[2]);
                    } else if (isMinute) {
                        textSize(currentMinuteSize);
                        stroke(minuteStrokeColor[0], minuteStrokeColor[1], minuteStrokeColor[2]);
                        strokeWeight(handCount >= 2 ? 10 : 2);
                        fill(minuteFillColor[0], minuteFillColor[1], minuteFillColor[2]);
                    } else if (isSecond) {
                        textSize(currentSecondSize);
                        stroke(secondStrokeColor[0], secondStrokeColor[1], secondStrokeColor[2]);
                        strokeWeight(handCount >= 2 ? 10 : 2);
                        fill(secondFillColor[0], secondFillColor[1], secondFillColor[2]);
                    }
                    
                    text(num.value, num.x, num.y);
                }
            });
        }
    }
}

function updateSquiggles() {
    // Get the current hour based on the clock mode
    let h = is24HourMode ? hour() : hour() % 12;
    let m = minute();
    let s = second();
    
    let hourTarget = numbers.find(n => n.value === h);
    let minuteTarget = numbers.find(n => n.value === m);
    let secondTarget = numbers.find(n => n.value === s);
    
    // Debug logging for hour targeting
    if (!hourTarget) {
        console.log("Warning: No target found for hour:", h, "24-hour mode:", is24HourMode);
        console.log("Available hour numbers:", numbers.filter(n => n.value < (is24HourMode ? 24 : 12)).map(n => n.value));
    }
    
    updateSquiggle(hourSquiggle, hourTarget, 0.05, 1);
    updateSquiggle(minuteSquiggle, minuteTarget, 0.08, 2);
    updateSquiggle(secondSquiggle, secondTarget, 0.1, 3);
}

function updateSquiggle(squiggle, target, speed, frequencyMult) {
    if (!target) return;
    
    if (clockMode === 'circular') {
        let radius = frequencyMult === 3 ? 60 : (frequencyMult === 2 ? 75 : 150);
        
        // Determine which orbit center to use
        let currentOrbit;
        if (frequencyMult === 1) currentOrbit = currentHourOrbit;
        else if (frequencyMult === 2) currentOrbit = currentMinuteOrbit;
        else currentOrbit = currentSecondOrbit;
        
        // Smoothly move the orbit center to the new target
        currentOrbit.x = lerp(currentOrbit.x, target.x, 0.1); // Slower transition
        currentOrbit.y = lerp(currentOrbit.y, target.y, 0.1); // Slower transition
        
        // Update head of squiggle with spiral motion
        let angle = rotationAngle * frequencyMult;
        squiggle[0].x = currentOrbit.x + cos(angle) * radius;
        squiggle[0].y = currentOrbit.y + sin(angle) * radius;
        
        // Update rest of squiggle with fluid spiral motion
        for (let i = 1; i < squiggle.length; i++) {
            let prev = squiggle[i-1];
            let current = squiggle[i];
            
            // Calculate delayed angle for spiral effect
            let delayedAngle = angle - (i * 0.3);
            let spiralRadius = radius * (1 - i / squiggle.length * 0.3);
            
            // Add organic movement with noise
            let noiseVal = noise(noiseOffset + i * 0.75) * 0.5;
            
            // Calculate target position on spiral
            let spiralX = currentOrbit.x + cos(delayedAngle + noiseVal) * spiralRadius;
            let spiralY = currentOrbit.y + sin(delayedAngle + noiseVal) * spiralRadius;
            
            // Calculate direction from previous point
            let dx = spiralX - prev.x;
            let dy = spiralY - prev.y;
            let segmentAngle = atan2(dy, dx);
            
            // Add slight noise to the angle for organic movement
            segmentAngle += map(noiseVal, 0, 1, -0.2, 0.2);
            
            let segmentLength = 8;
            let targetX = prev.x + cos(segmentAngle) * segmentLength;
            let targetY = prev.y + sin(segmentAngle) * segmentLength;
            
            // Blend between spiral position and segment-based position
            let blend = 0.7; // Higher value = more spiral influence
            let finalX = lerp(targetX, spiralX, blend);
            let finalY = lerp(targetY, spiralY, blend);
            
            // Smooth movement - faster for segments closer to head
            let smoothness = map(i, 1, squiggle.length - 1, 0.4, 0.2);
            current.x = lerp(current.x, finalX, smoothness);
            current.y = lerp(current.y, finalY, smoothness);
        }
    } else {
        // Radial mode - straight lines with smooth transitions
        let currentTarget;
        if (frequencyMult === 1) currentTarget = currentHourTarget;
        else if (frequencyMult === 2) currentTarget = currentMinuteTarget;
        else currentTarget = currentSecondTarget;
        
        // Smoothly update the current target position
        currentTarget.x = lerp(currentTarget.x, target.x, 0.1);
        currentTarget.y = lerp(currentTarget.y, target.y, 0.1);
        
        let angle = atan2(currentTarget.y - centerPoint.y, currentTarget.x - centerPoint.x);
        let distance = dist(centerPoint.x, centerPoint.y, currentTarget.x, currentTarget.y);
        
        // Create straight line from center to current target
        for (let i = 0; i < squiggle.length; i++) {
            let progress = i / (squiggle.length - 1);
            let currentDistance = distance * progress;
            
            squiggle[i].x = centerPoint.x + cos(angle) * currentDistance;
            squiggle[i].y = centerPoint.y + sin(angle) * currentDistance;
        }
    }
    
    noiseOffset += 0.01;
}

function drawSquiggle(squiggle, col, timeValue) {
    if (clockMode === 'radial') {
        // Get the current interpolated target position based on the color
        let currentTarget;
        if (red(col) > 0) {  // Red = hour hand
            currentTarget = currentHourTarget;
        } else if (green(col) > 0) {  // Green = minute hand
            currentTarget = currentMinuteTarget;
        } else {  // Blue = second hand
            currentTarget = currentSecondTarget;
        }
        
        // Draw filled circle first (behind the line)
        let circleRadius;
        if (red(col) > 0) {  // Red = hour hand
            circleRadius = 150;
        } else if (green(col) > 0) {  // Green = minute hand
            circleRadius = 75;
        } else {  // Blue = second hand
            circleRadius = 45;
        }
        
        // Draw the circle at the current interpolated position
        fill(red(col), green(col), blue(col), 255);
        noStroke();
        ellipse(currentTarget.x, currentTarget.y, circleRadius * 2);
    }
    
    // Draw the line
    noFill();
    stroke(col);
    strokeWeight(3);
    
    beginShape();
    if (clockMode === 'radial') {
        // Use straight lines for radial mode
        for (let i = 0; i < squiggle.length; i++) {
            vertex(squiggle[i].x, squiggle[i].y);
        }
    } else {
        // Use curved vertices for circular mode
        curveVertex(squiggle[0].x, squiggle[0].y);
        for (let i = 0; i < squiggle.length; i++) {
            curveVertex(squiggle[i].x, squiggle[i].y);
        }
        curveVertex(squiggle[squiggle.length-1].x, squiggle[squiggle.length-1].y);
    }
    endShape();
}

// Helper function to check if a number is within a circle
function checkNumberInCircle(num, targetValue, radius) {
    let target = numbers.find(n => n.value === targetValue);
    if (!target) return false;
    if (num.value === targetValue) return true;
    let d = dist(num.x, num.y, target.x, target.y);
    return d < radius;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // Keep center point in middle 3/5ths after resize
    if (clockMode === 'radial') {
        let centerX = random(width * 0.2, width * 0.8);
        let centerY = random(height * 0.2, height * 0.8);
        centerPoint = createVector(centerX, centerY);
    } else {
        centerPoint = createVector(width/2, height/2);
    }
    
    // Reinitialize positions
    let maxNumbers = is24HourMode ? 24 : 12;
    numbers = numbers.map(num => {
        if (num.value < maxNumbers || num.value >= maxNumbers) {
            return {
                ...num,
                x: random(width * 0.1, width * 0.9),
                y: random(height * 0.1, height * 0.9)
            };
        }
        return num;
    });
    
    // Reinitialize string mode points if in string mode
    if (clockMode === 'string') {
        initializeStringMode();
    }
    
    // Reset current positions
    let currentHour = is24HourMode ? hour() : hour() % 12;
    let currentMinute = minute();
    let currentSecond = second();
    
    let hourNum = numbers.find(n => n.value === currentHour);
    let minuteNum = numbers.find(n => n.value === currentMinute);
    let secondNum = numbers.find(n => n.value === currentSecond);
    
    if (hourNum) {
        currentHourTarget.x = hourNum.x;
        currentHourTarget.y = hourNum.y;
        currentHourOrbit.x = hourNum.x;
        currentHourOrbit.y = hourNum.y;
    }
    if (minuteNum) {
        currentMinuteTarget.x = minuteNum.x;
        currentMinuteTarget.y = minuteNum.y;
        currentMinuteOrbit.x = minuteNum.x;
        currentMinuteOrbit.y = minuteNum.y;
    }
    if (secondNum) {
        currentSecondTarget.x = secondNum.x;
        currentSecondTarget.y = secondNum.y;
        currentSecondOrbit.x = secondNum.x;
        currentSecondOrbit.y = secondNum.y;
    }
    
    initializeSquiggles();
} 