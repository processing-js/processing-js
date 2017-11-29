//
//  ViewController.h
//  Processing for iOS
//
//  Created by Frederik Riedel on 27.06.15.
//  Copyright (c) 2015 Frederik Riedel. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "FileManager.h"
#import "PDEFile.h"
#import "PDESketch.h"
#import "PDEEditorViewController.h"
#import "SettingsViewController.h"

@interface PDEFileSelectorViewController : UITableViewController


@property (strong, nonatomic) IBOutlet UITableView *table;
@property(nonatomic,strong) NSArray<PDESketch*>* pdeSketches;

@end

