//
//  ViewController.m
//  Processing for iOS
//
//  Created by Frederik Riedel on 27.06.15.
//  Copyright (c) 2015 Frederik Riedel. All rights reserved.
//

#import "PDEFileSelectorViewController.h"
#import "AboutViewController.h"
#import "SketchController.h"
#import "Processing_for_iOS-Swift.h"

@interface PDEFileSelectorViewController ()

@end

@implementation PDEFileSelectorViewController
- (void)viewDidLoad {
    [super viewDidLoad];

    self.table.rowHeight = 66.f;
    

    [SketchController loadSketches:^(NSArray<PDESketch *> *sketches) {
        self.pdeSketches = sketches;
        [self.table reloadData];
    }];
    
    
    
    UIBarButtonItem *addNewFile = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAdd target:self action:@selector(addNewFile)];
    
    self.navigationItem.rightBarButtonItem = addNewFile;
    
    self.table.allowsMultipleSelectionDuringEditing = NO;
    
    // Do any additional setup after loading the view, typically from a nib.
}

-(void) settings {
    SettingsViewController *settingsViewController = [SettingsViewController new];
    
    UINavigationController *settingsNavigationController = [[UINavigationController alloc] initWithRootViewController:settingsViewController];
    
    [self.navigationController presentViewController:settingsNavigationController animated:YES completion: nil];
    
}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

-(void) addNewFile {
    UIAlertView *alert=[[UIAlertView alloc]initWithTitle:@"New Processing Sketch" message:@"" delegate:self cancelButtonTitle:@"Cancel" otherButtonTitles:@"Create", nil];
    alert.alertViewStyle=UIAlertViewStylePlainTextInput;
    //UITextField *textField=[alert textFieldAtIndex:0];
    [alert show];
    
}

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    UITextField *textField=[alertView textFieldAtIndex:0];
    [textField resignFirstResponder];
    
    if(buttonIndex==1)
    {
        NSString *newFileName = textField.text;
        
        NSMutableCharacterSet *letters = [NSMutableCharacterSet letterCharacterSet];
        [letters addCharactersInString:@"_1234567890"];
        
        // Check if file name contains forbidden characters.
        if([newFileName isEqualToString:@""]) {
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Error" message:@"Name should be at least one character." delegate:self cancelButtonTitle:@"Cancel" otherButtonTitles:@"Create", nil];
            alert.alertViewStyle=UIAlertViewStylePlainTextInput;
            [alert show];
        } else if([self nameAlreadyExists:newFileName]) {
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Error" message:[NSString stringWithFormat:@"File with name '%@' already exists. Please choose another name or delete this one first.",newFileName] delegate:self cancelButtonTitle:@"Cancel" otherButtonTitles:@"Create", nil];
            alert.alertViewStyle=UIAlertViewStylePlainTextInput;
            [alert show];
        } else if([newFileName containsString:@" "]) {
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Error" message:[NSString stringWithFormat:@"File name should not contain spaces."] delegate:self cancelButtonTitle:@"Cancel" otherButtonTitles:@"Create", nil];
            alert.alertViewStyle=UIAlertViewStylePlainTextInput;
            UITextField *textField=[alert textFieldAtIndex:0];
            textField.text=[newFileName stringByReplacingOccurrencesOfString:@" " withString:@"_"];
            [alert show];
        } else if(![letters isSupersetOfSet: [NSCharacterSet characterSetWithCharactersInString:newFileName]]) {
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Error" message:[NSString stringWithFormat:@"File name should contain no fancy symbols."] delegate:self cancelButtonTitle:@"Cancel" otherButtonTitles:@"Create", nil];
            alert.alertViewStyle=UIAlertViewStylePlainTextInput;
            UITextField *textField=[alert textFieldAtIndex:0];
            textField.text=[@"sketch_" stringByAppendingString:newFileName];
            [alert show];
        } else {
            // Filename is correct.
            PDESketch* newSketch = [[PDESketch alloc] initWithSketchName:newFileName];
            [SketchController savePDESketch:newSketch];
            
            PDEFile* newPDEFile = [[PDEFile alloc] initWithFileName:newFileName partOfSketch:newSketch];
            [newPDEFile saveCode:@"void setup() {\n   size(screen.width, screen.height);\n}\n\nvoid draw() {\n   background(0,0,255);\n}"];
            
            [SketchController loadSketches:^(NSArray<PDESketch *> *sketches) {
                self.pdeSketches = sketches;
                [self.table reloadData];
            }];
        }
        
    }
}


-(BOOL) nameAlreadyExists:(NSString *) newName {
    for(PDESketch *sketch in self.pdeSketches) {
        if([sketch.sketchName isEqualToString:newName]) {
            return true;
        }
    }
    return false;
}


-(NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 1;
}


-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.pdeSketches.count;
}

-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"pdeFileCell"];
    
    if(!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"pdeFileCell"];
    }
    
    PDESketch *sketch = [self.pdeSketches objectAtIndex:indexPath.row];
    cell.textLabel.text=sketch.sketchName;
    cell.imageView.image = [UIImage imageNamed:@"folder"];
    return cell;
}

-(UIStatusBarStyle)preferredStatusBarStyle {
    return UIStatusBarStyleLightContent;
}


-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    PDESketch *selectedSketch = [self.pdeSketches objectAtIndex:indexPath.row];
    PDEEditorViewController *editor = [[PDEEditorViewController alloc] initWithPDESketch:selectedSketch];
    [self.navigationController pushViewController:editor animated:YES];
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
}

-(CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 66.f;
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath {
    // Return YES if you want the specified item to be editable.
    return YES;
}

- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath {
    if (editingStyle == UITableViewCellEditingStyleDelete) {
        PDESketch *selectedSketch = [self.pdeSketches objectAtIndex:indexPath.row];
        [SketchController deleteSketchWithName:selectedSketch.sketchName];
        
        [SketchController loadSketches:^(NSArray<PDESketch *> *sketches) {
            self.pdeSketches = sketches;
            [self.table deleteRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationAutomatic];
        }];

    }
}

- (IBAction)about:(id)sender {
    AboutViewController* about = [AboutViewController new];
    
    ProcessingNavigationViewController* aboutNavController = [[ProcessingNavigationViewController alloc] initWithRootViewController:about];
    aboutNavController.modalTransitionStyle = UIModalTransitionStyleCoverVertical;
    aboutNavController.modalPresentationStyle = UIModalPresentationFormSheet;
    
    [self.navigationController presentViewController:aboutNavController animated:YES completion:^{
        
    }];
}


@end
