//
//  UIColor+RiedelColor.m
//  Krypton
//
//  Created by Frederik Riedel on 13.09.15.
//  Copyright (c) 2015 Quappi. All rights reserved.
//

#import "UIColor+ProcessingColor.h"

@implementation UIColor (ProcessingColor)

+(UIColor *) processingColor {
    return [UIColor colorWithRed:32.f/255.f green:58.f/255.f blue:92.f/255.f alpha:1.0];
}

+(UIColor *) batteryFullColor {
    return [UIColor colorWithRed:118.f/255.f green:214.f/255.f blue:113.f/255.f alpha:1.0];
}

+(UIColor *) selectionColor {
    return [UIColor colorWithRed:100.f/255.f green:100.f/255.f blue:100.f/255.f alpha:1.0];
}

@end