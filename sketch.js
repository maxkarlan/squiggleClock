let numbers = [];
let hourSquiggle = [];
let minuteSquiggle = [];
let secondSquiggle = [];
let squiggleLength = 30;
let noiseOffset = 0;
let rotationAngle = 0;
let minSpacing = 50;
let lastSecond = -1;
let targetSizes = new Array(60).fill(0);
let currentSizes = new Array(60).fill(0);

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Initialize number positions with random scattering
    let attempts = 0;
    let maxAttempts = 1000;
    
    for (let i = 0; i < 60; i++) {
        let placed = false;
        attempts = 0;
        
        while (!placed && attempts < maxAttempts) {
            let x = random(width * 0.1, width * 0.9);
            let y = random(height * 0.1, height * 0.9);
            
            // Check if this position is far enough from other numbers
            let validPosition = true;
            for (let j = 0; j < numbers.length; j++) {
                let dx = x - numbers[j].x;
                let dy = y - numbers[j].y;
                let dist = sqrt(dx * dx + dy * dy);
                if (dist < minSpacing) {
                    validPosition = false;
                    break;
                }
            }
            
            if (validPosition) {
                numbers.push({
                    value: i,
                    x: x,
                    y: y
                });
                placed = true;
            }
            attempts++;
        }
        
        // If we couldn't place the number after max attempts, place it anyway
        if (!placed) {
            numbers.push({
                value: i,
                x: random(width * 0.1, width * 0.9),
                y: random(height * 0.1, height * 0.9)
            });
        }
    }
    
    // Initialize squiggles
    for (let i = 0; i < squiggleLength; i++) {
        hourSquiggle.push(createVector(0, 0));
        minuteSquiggle.push(createVector(0, 0));
        secondSquiggle.push(createVector(0, 0));
    }
}

function draw() {
    background(240);
    rotationAngle += 0.02;
    
    // Update target sizes based on current second
    let currentSecond = second();
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
    
    // Draw numbers with dynamic sizes
    textAlign(CENTER, CENTER);
    
    // Get current hour and minute
    let currentHour = hour() % 12;
    let currentMinute = minute();
    
    // Draw glowing hour and minute numbers
    numbers.forEach(num => {
        if (num.value === currentHour) {
            // Draw hour number glow (red)
            textSize(275);
            noStroke();
            for (let i = 0; i < 10; i++) {
                let offset = i * 0.5;
                let alpha = map(i, 0, 9, 20, 0);
                fill(255, 0, 0, alpha);
                // Draw multiple times with slight offsets
                text(num.value, num.x - offset, num.y);
                text(num.value, num.x + offset, num.y);
                text(num.value, num.x, num.y - offset);
                text(num.value, num.x, num.y + offset);
                text(num.value, num.x - offset, num.y - offset);
                text(num.value, num.x + offset, num.y - offset);
                text(num.value, num.x - offset, num.y + offset);
                text(num.value, num.x + offset, num.y + offset);
            }
            // Draw the main hour number
            fill(255, 0, 0);
            text(num.value, num.x, num.y);
        } else if (num.value === currentMinute) {
            // Draw minute number glow (green)
            textSize(75);
            noStroke();
            for (let i = 0; i < 10; i++) {
                let offset = i * 0.5;
                let alpha = map(i, 0, 9, 20, 0);
                fill(0, 255, 0, alpha);
                // Draw multiple times with slight offsets
                text(num.value, num.x - offset, num.y);
                text(num.value, num.x + offset, num.y);
                text(num.value, num.x, num.y - offset);
                text(num.value, num.x, num.y + offset);
                text(num.value, num.x - offset, num.y - offset);
                text(num.value, num.x + offset, num.y - offset);
                text(num.value, num.x - offset, num.y + offset);
                text(num.value, num.x + offset, num.y + offset);
            }
            // Draw the main minute number
            fill(0, 255, 0);
            text(num.value, num.x, num.y);
        } else {
            // Draw regular numbers
            textSize(currentSizes[num.value]);
            fill(0);
            text(num.value, num.x, num.y);
        }
    });
    
    // Update and draw squiggles
    updateSquiggles();
    drawSquiggle(hourSquiggle, color(255, 0, 0, 200));    // Red for hours
    drawSquiggle(minuteSquiggle, color(0, 255, 0, 200));  // Green for minutes
    drawSquiggle(secondSquiggle, color(0, 0, 255, 200));  // Blue for seconds
}

function updateSquiggles() {
    let h = hour() % 12;
    let m = minute();
    let s = second();
    
    // Find target positions for exact time values
    let hourTarget = numbers.find(n => n.value === h);
    let minuteTarget = numbers.find(n => n.value === m);
    let secondTarget = numbers.find(n => n.value === s);
    
    // Update squiggles with different speeds
    updateSquiggle(hourSquiggle, hourTarget, 0.05, 1);
    updateSquiggle(minuteSquiggle, minuteTarget, 0.08, 2);
    updateSquiggle(secondSquiggle, secondTarget, 0.1, 3);
}

function updateSquiggle(squiggle, target, speed, frequencyMult) {
    if (!target) return;
    
    // Calculate base radius for wrapping based on time unit
    let radius;
    if (frequencyMult === 3) { // seconds
        radius = 60;
    } else if (frequencyMult === 2) { // minutes
        radius = 75;
    } else { // hours
        radius = 150;
    }
    
    // Update head position with smooth approach
    let dx = target.x - squiggle[0].x;
    let dy = target.y - squiggle[0].y;
    let dist = sqrt(dx * dx + dy * dy);
    
    if (dist > 5) {
        squiggle[0].x += dx * speed;
        squiggle[0].y += dy * speed;
    } else {
        // When close to target, start wrapping
        let angle = rotationAngle * frequencyMult;
        squiggle[0].x = target.x + cos(angle) * radius;
        squiggle[0].y = target.y + sin(angle) * radius;
    }
    
    // Update rest of squiggle with fluid motion
    for (let i = 1; i < squiggle.length; i++) {
        let prev = squiggle[i-1];
        let current = squiggle[i];
        
        // Calculate delay for trailing effect
        let delayedAngle = rotationAngle * frequencyMult - (i * 0.2);
        let noiseVal = noise(noiseOffset + i * 0.1) * 0.5;
        
        // Adjust radius for each point to create spiral effect
        let adjustedRadius = radius * (1 - i / squiggle.length * 0.5);
        
        // Calculate position with noise and spiral effect
        if (dist <= radius * 1.5) {
            let spiralAngle = delayedAngle + noiseVal;
            let targetX = target.x + cos(spiralAngle) * adjustedRadius;
            let targetY = target.y + sin(spiralAngle) * adjustedRadius;
            
            current.x = lerp(current.x, targetX, 0.1);
            current.y = lerp(current.y, targetY, 0.1);
        } else {
            // When far from target, create flowing motion
            let angle = atan2(current.y - prev.y, current.x - prev.x);
            angle += map(noiseVal, 0, 1, -0.3, 0.3);
            
            let segmentLength = 8;
            current.x = lerp(current.x, prev.x + cos(angle) * segmentLength, 0.3);
            current.y = lerp(current.y, prev.y + sin(angle) * segmentLength, 0.3);
        }
    }
    
    noiseOffset += 0.01;
}

function drawSquiggle(squiggle, col) {
    noFill();
    stroke(col);
    strokeWeight(3);
    beginShape();
    for (let i = 0; i < squiggle.length; i++) {
        curveVertex(squiggle[i].x, squiggle[i].y);
    }
    endShape();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
} 