//
//  UIColor+RiedelColor.h
//  Krypton
//
//  Created by Frederik Riedel on 13.09.15.
//  Copyright (c) 2015 Quappi. All rights reserved.
//

#import <UIKit/UIKit.h>

/*!
 @class UIColor (ProcessingColor)
 @brief UIColor (ProcessingColor) is a category that enlarges UIColer with the ProcessingColors
 @superclass SuperClass: NSObject\n
 */
@interface UIColor (ProcessingColor)

+(UIColor *) processingColor;
+(UIColor *) selectionColor;
+(UIColor *) batteryFullColor;

@end