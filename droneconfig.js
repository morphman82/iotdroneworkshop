// Publish Data from drone devices - droneconfig.js

/*
* Copyright 2010-2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License").
* You may not use this file except in compliance with the License.
* A copy of the License is located at
*
*  http://aws.amazon.com/apache2.0
*
* or in the "license" file accompanying this file. This file is distributed
* on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
* express or implied. See the License for the specific language governing
* permissions and limitations under the License.
*/

// Require AWS IoT Device SDK
const awsIoT = require('aws-iot-device-sdk');

// Require crypto for random numbers generation
const crypto = require('crypto');

// Load the endpoint from file
const endpointFile = require('/home/ec2-user/environment/endpoint.json');

// Fetch the deviceName from the folder name
const deviceName = __dirname.split('/').pop();

// Create the thingShadow object with argument data
const device = awsIoT.device({
   keyPath: 'private.pem.key',
  certPath: 'certificate.pem.crt',
    caPath: '/home/ec2-user/environment/root-CA.crt',
  clientId: deviceName,
      host: endpointFile.endpointAddress
});

// Function that gets executed when the connection to IoT is established
device.on('connect', function() {
    console.log('Connected to AWS IoT');
    
    // Start the publish loop
    infiniteLoopPublish();
});

// Function sending drone telemetry data every 10 seconds
function infiniteLoopPublish() {
    console.log('Sending drone telemetry data to AWS IoT for ' + deviceName);
    // Publish drone data to edx/telemetry topic with getDroneData
    device.publish("aws/telemetry", JSON.stringify(getDroneData(deviceName)));
    
    // Start Infinite Loop of Publish every 10 seconds
    setTimeout(infiniteLoopPublish, 10000);
}

// Function to create a random float between minValue and maxValue
function randomFloatBetween(minValue,maxValue){
    return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue));
}

// Generate random drone data based on the deviceName
function getDroneData(deviceName) {
    let message = {
        'flight_id': crypto.randomBytes(15).toString('hex'),
        'dcmotor_speed_mean': randomFloatBetween(10.55555, 99.55555),
        'battery_level': randomFloatBetween(0, 100),
        'collision_avoidance_event': randomFloatBetween(0, 1),
        'restricted_airspace_event': randomFloatBetween(0, 1),
        'daily_hours_flown': randomFloatBetween(0.374318249, 8.142630049),
        'battery_temp_mean': randomFloatBetween(55.7100589, 95.3165256)
    };
    
    const device_data = { 
        'drone1': {
            'vin': 'INTERCEPTOR-NO1',
            'latitude':39.122229,
            'longitude':-77.133578
        },
        'drone2': {
            'vin': 'INTERCEPTOR-NO2',
            'latitude': 40.8173411,
            'longitude': -73.94332990000001
        }
    };
  
    message['vin'] = device_data[deviceName].vin;
    message['latitude'] = device_data[deviceName].latitude;
    message['longitude'] = device_data[deviceName].longitude;
    message['device'] = deviceName;
    message['datetime'] = new Date().toISOString().replace(/\..+/, '');
    
    return message;
}