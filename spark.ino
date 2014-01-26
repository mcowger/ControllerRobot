/**
 ******************************************************************************
 * @file    application.cpp
 * @authors  Satish Nair, Zachary Crockett and Mohit Bhoite
 * @version V1.0.0
 * @date    05-November-2013
 * @brief   Tinker application
 ******************************************************************************
  Copyright (c) 2013 Spark Labs, Inc.  All rights reserved.

  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation, either
  version 3 of the License, or (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this program; if not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************
 */
 
 /*
   JSON RC Car Controller....heavily adapted from the Tinker firmware at:
   https://github.com/spark/core-firmware/blob/master/src/application.cpp
 */

/* Includes ------------------------------------------------------------------*/  
#include "application.h"

/* Function prototypes -------------------------------------------------------*/


//Motor Pin -> Arduino Pin -> Spark Pin
//M1        ->  4         -> D3
//M2        ->  7         -> D4
//E1        ->  5         -> D1
//E2        ->  6         -> A7

int M1 = D3;
int M2 = D4;
int E1 = D1;
int E2 = A7;
int led = D7;
int version = 6;
int setMotors(String command);
int splitString(String s, int index);


int splitString(String s, int index) {
    
    int pivot = s.indexOf(',');
    String Lstring = s.substring(0,pivot);
    String Rstring = s.substring(pivot+1,s.length());
    if (index == 0) return Lstring.toInt();
    if (index == 1) return Rstring.toInt();
    return 999;

}

int setMotors(String command)
{
    int Lin = constrain(splitString(command,0),0,100);
    int Rin = constrain(splitString(command,1),0,100);
    
    if (Lin == 0) {
      //Our input for the left motor was 0, so lets set E1 to low and M1 to 'any voltage' to disable the motor as per the truth table
      digitalWrite(E1,LOW);
      digitalWrite(M1,HIGH);
      //return -1;
    }
    if (Rin == 0) {
      //Our input for the right motor was 0, so lets set E1 to low and M1 to 'any voltage' to disable the motor as per the truth table
      digitalWrite(E2,LOW);
      digitalWrite(M2,HIGH);
      //return -2;
    }
    if (Lin > 0) {
      Lin = constrain(Lin,20,100);
      //Our input for the left motor was > 0, so we want to not reverse this motor.  We need to set M1 to 'any voltage' and PWM to E1
      //First set M1 to HIGH:
      digitalWrite(M1,HIGH);
      //Next lets map the input value we got (1-100) to a PWM value (1-255)
      int Lpow = map(Lin,1,100,1,255);
      //Now lets actually write that to the motor
      analogWrite(E1,Lpow);
      //return Lpow;

    }
    if (Rin > 0) {
      Rin = constrain(Rin,20,100);
      //Our input for the left motor was > 0, so we want to not reverse this motor.  We need to set M1 to 'any voltage' and PWM to E1
      //First set M1 to HIGH:
      digitalWrite(M2,HIGH);
      //Next lets map the input value we got (1-100) to a PWM value (1-255)
      int Rpow = map(Rin,1,100,1,255);
      //Now lets actually write that to the motor
      analogWrite(E2,Rpow);
      //return Rpow;
    }
    
    return -5;
    
}


/* This function is called once at start up ----------------------------------*/
void setup()
{
    //Register all the  functions
    Spark.function("setMotors", setMotors);
    Spark.variable("version", &version, INT);
    
    pinMode(led,OUTPUT);
    pinMode(M1,OUTPUT);
    pinMode(M2,OUTPUT);
    
    pinMode(E1,OUTPUT);
    pinMode(E2,OUTPUT);
}

/* This function loops forever --------------------------------------------*/
void loop() {}

