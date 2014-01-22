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

int L = 999;
int R = 999;

float delayBetweenBlinks = 1000; //in calcMS

int led = D7;


int setMotors(String command);

int splitString(String s, char parser,int index);

int splitString(String s, int index){
    int pivot = s.indexOf(',');
    String Lstring = s.substring(0,pivot);
    String Rstring = s.substring(pivot+1,s.length());
    if (index == 0) return Lstring.toInt();
    if (index == 1) return Rstring.toInt();
    return 999;
}




/* This function is called once at start up ----------------------------------*/
void setup()
{

	//Register all the  functions
	Spark.function("setMotors", setMotors);
    pinMode(led, OUTPUT);

}

/* This function loops forever --------------------------------------------*/
void loop()
{


    digitalWrite(led,HIGH);
    delay(delayBetweenBlinks);
    digitalWrite(led,LOW);
    delay(delayBetweenBlinks);
}



int setMotors(String command)
{
    L = constrain(splitString(command,0),1,100);
    R = constrain(splitString(command,1),1,100);


    delayBetweenBlinks = map(L,0,100,500,50);


    return delayBetweenBlinks;

}
