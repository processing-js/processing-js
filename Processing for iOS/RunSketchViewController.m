//
//  RunSketchViewController.m
//  Processing for iOS
//
//  Created by Frederik Riedel on 27.06.15.
//  Copyright (c) 2015 Frederik Riedel. All rights reserved.
//

#import "RunSketchViewController.h"


@implementation RunSketchViewController

-(id)initWithPDEFile:(PDESketch*)pdeSketch {
    self = [super initWithNibName:nil bundle:nil];
    
    if(self) {
        self.pdeSketch = pdeSketch;
        self.title = self.pdeSketch.sketchName;
        
        WKWebViewConfiguration* configuration = [WKWebViewConfiguration new];
        WKUserContentController* contentController = [WKUserContentController new];
        configuration.userContentController = contentController;
        [configuration.userContentController addScriptMessageHandler:self name:@"iosbridge"];
        
        self.sketchWebView = [[WKWebView alloc] initWithFrame:CGRectMake(0, 0, self.view.frame.size.width, self.view.frame.size.height) configuration:configuration];

        
        [self.view addSubview:self.sketchWebView];
        
        self.view.backgroundColor = [UIColor blackColor];
        
        self.sketchWebView.backgroundColor=[UIColor clearColor];
        self.sketchWebView.opaque=NO;
        
        self.sketchWebView.scrollView.scrollEnabled = NO;
        self.sketchWebView.scrollView.bounces = NO;
        
        
        NSString *processingjs = [NSString stringWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"processing.min" ofType:@"js"] encoding:NSUTF8StringEncoding error:nil];
        
        NSString* content = [NSString stringWithFormat:[FileManager containerFile],processingjs,self.pdeSketch.cummulatedSourceCode];
        
        NSURL* baseURL = [[NSURL fileURLWithPath:pdeSketch.filePath] URLByAppendingPathComponent:@"data"];
        [self.sketchWebView loadHTMLString:content baseURL: baseURL];
        
        self.motionManager = [CMMotionManager new];

        [self startAccelerometerListener];
        [self startGyroscopeListener];

    }

    return self;
}
    
    
-(void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
    NSLog(@"didReceiveScriptMessage: %@", message.body);
}
    
    
-(void) startAccelerometerListener {
    if([self.motionManager isAccelerometerAvailable]) {
        [self.motionManager setAccelerometerUpdateInterval:0.02];
        
        [self.motionManager startAccelerometerUpdatesToQueue:[NSOperationQueue mainQueue]
                                                 withHandler:^(CMAccelerometerData * _Nullable accelerometerData, NSError * _Nullable error) {
                                                     
                                                     [self.sketchWebView evaluateJavaScript:[NSString stringWithFormat:@"var pjs = Processing.getInstanceById('Sketch');"
                                                                                             "pjs.accelerometerUpdated(%f,%f,%f);", accelerometerData.acceleration.x, accelerometerData.acceleration.y, accelerometerData.acceleration.z] completionHandler:^(id _Nullable result, NSError * _Nullable error) {

                                                         NSLog(@"%@, %@",result, error.description);


                                                     }];

                                                     
                                                 }];
    } else {
         NSLog(@"Accelerometer not Available!");
    }
}

-(void) startGyroscopeListener {
    //Gyroscope
    if([self.motionManager isGyroAvailable])
    {
        
            
            [self.motionManager setGyroUpdateInterval:0.02];
            
            /* Add on a handler block object */
            
            /* Receive the gyroscope data on this block */
            [self.motionManager startGyroUpdatesToQueue:[NSOperationQueue mainQueue]
                                            withHandler:^(CMGyroData *gyroData, NSError *error)
             {

                 [self.sketchWebView evaluateJavaScript:[NSString stringWithFormat:@"var pjs = Processing.getInstanceById('Sketch');"
                                                         "pjs.gyroscopeUpdated(%f,%f,%f);", gyroData.rotationRate.x, gyroData.rotationRate.y, gyroData.rotationRate.z] completionHandler:^(id _Nullable result, NSError * _Nullable error) {

                 }];
                 
                 
                 
             }];
    }
    else
    {
        NSLog(@"Gyroscope not Available!");
    }
}



-(void)viewWillLayoutSubviews {
    self.sketchWebView.frame=CGRectMake(0, 0, self.view.frame.size.width, self.view.frame.size.height);
}

-(void)viewWillDisappear:(BOOL)animated {
    self.sketchWebView = nil;
    [self.motionManager stopGyroUpdates];
    [self.motionManager stopAccelerometerUpdates];
    self.motionManager = nil;
}

-(void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self.navigationController setToolbarHidden:YES animated:YES];
}

-(void) close {
    
    [self.navigationController popViewControllerAnimated:YES];
}

-(NSArray<UIKeyCommand *> *)keyCommands {
    
    UIKeyCommand* close = [UIKeyCommand keyCommandWithInput:@"w" modifierFlags:UIKeyModifierCommand action:@selector(close) discoverabilityTitle:@"Close Sketch"];
    UIKeyCommand *esc = [UIKeyCommand keyCommandWithInput: UIKeyInputEscape modifierFlags: 0 action: @selector(close) discoverabilityTitle:@"Close Sketch"];
    
    return @[close, esc];
}

-(BOOL)canBecomeFirstResponder {
    return YES;
}


@end
