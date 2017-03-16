//
//  ViewController.m
//  Processing for iOS
//
//  Created by Frederik Riedel on 27.06.15.
//  Copyright (c) 2015 Frederik Riedel. All rights reserved.
//

#import "PDEFileSelectorViewController.h"
#import "AboutViewController.h"

@interface PDEFileSelectorViewController ()

@end

@implementation PDEFileSelectorViewController
@synthesize table,pdeFiles;
- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.title=@"My Projects";
    
    //self.view.backgroundColor=[UIColor greenColor];
    
    //self.table = [[UITableView alloc] initWithFrame:CGRectMake(0, 0, self.view.frame.size.width,self.view.frame.size.height) style:UITableViewStylePlain];
    
    //self.table.dataSource=self;
    //self.table.delegate=self;
    self.table.rowHeight = 66.f;
    
    //[self.view addSubview:self.table];
    
    pdeFiles = [[NSMutableArray alloc] init];
    
    NSString *programmCodesPath = [[FileManager documentsDirectory] stringByAppendingPathComponent:@"menu.txt"];
    NSString *programmCodesString = [NSString stringWithContentsOfFile:programmCodesPath encoding:NSUTF8StringEncoding error:NULL];
    
    for(NSString *fileName in [programmCodesString componentsSeparatedByString:@"\n"]) {
        if(![fileName isEqualToString:@""]) {
            PDEFile *file = [[PDEFile alloc] initWithFileName:fileName];
            [pdeFiles addObject:file];
        }
    }
    
    NSString* documentsPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    NSString* firstStartFile = [documentsPath stringByAppendingPathComponent:@"firststart.txt"];
    BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:firstStartFile];
    
    if(!fileExists) {
        //first start
        [@"ALREADY INSTALLED" writeToFile:firstStartFile atomically:YES encoding:NSUTF8StringEncoding error:nil];
        
        firstStartFile = [documentsPath stringByAppendingPathComponent:@"menu.txt"];
        [pdeFiles insertObject:[[PDEFile alloc] initWithFileName:@"Example_3D"] atIndex:0];
        [pdeFiles insertObject:[[PDEFile alloc] initWithFileName:@"Example_Clock"] atIndex:0];
        [pdeFiles insertObject:[[PDEFile alloc] initWithFileName:@"Example_Draw"] atIndex:0];
        [pdeFiles insertObject:[[PDEFile alloc] initWithFileName:@"Example_FollowMe"] atIndex:0];
        [pdeFiles insertObject:[[PDEFile alloc] initWithFileName:@"Example_Multitouch"] atIndex:0];
        [pdeFiles insertObject:[[PDEFile alloc] initWithFileName:@"Example_Gyroscope_Accelerometer"] atIndex:0];
        [self savePDEFileList];
    }

    
    
    
    UIBarButtonItem *addNewFile = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAdd target:self action:@selector(addNewFile)];
    
    self.navigationItem.rightBarButtonItem=addNewFile;
    
    
    UIBarButtonItem *settingsBarButton = [[UIBarButtonItem alloc] initWithTitle:@"" style:UIBarButtonItemStyleDone target:self action:@selector(settings)];
    settingsBarButton.title = @"\u2699";
    UIFont *f1 = [UIFont fontWithName:@"Helvetica" size:24.0];
    NSDictionary *dict = [[NSDictionary alloc] initWithObjectsAndKeys:f1, UITextAttributeFont, nil]; [settingsBarButton setTitleTextAttributes:dict forState:UIControlStateNormal];
    //self.navigationItem.leftBarButtonItem=settingsBarButton;
    
    
    
    table.allowsMultipleSelectionDuringEditing = NO;
    
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
        
        NSCharacterSet *letters = [NSCharacterSet letterCharacterSet];
        
        //falsche dateinamen aussortieren
        if([newFileName isEqualToString:@""]) {
            UIAlertView *alert=[[UIAlertView alloc]initWithTitle:@"Error" message:@"Name should consist at least of one character." delegate:self cancelButtonTitle:@"Cancel" otherButtonTitles:@"Create", nil];
            alert.alertViewStyle=UIAlertViewStylePlainTextInput;
            [alert show];
        } else if([self nameAlreadyExists:newFileName]) {
            UIAlertView *alert=[[UIAlertView alloc]initWithTitle:@"Error" message:[NSString stringWithFormat:@"File with name '%@' already exists. Please choose another name or delete this one first.",newFileName] delegate:self cancelButtonTitle:@"Cancel" otherButtonTitles:@"Create", nil];
            alert.alertViewStyle=UIAlertViewStylePlainTextInput;
            [alert show];
        } else if([newFileName containsString:@" "]) {
            UIAlertView *alert=[[UIAlertView alloc]initWithTitle:@"Error" message:[NSString stringWithFormat:@"File name should not contain spaces."] delegate:self cancelButtonTitle:@"Cancel" otherButtonTitles:@"Create", nil];
            alert.alertViewStyle=UIAlertViewStylePlainTextInput;
            UITextField *textField=[alert textFieldAtIndex:0];
            textField.text=[newFileName stringByReplacingOccurrencesOfString:@" " withString:@"_"];
            [alert show];
        } else if(![letters isSupersetOfSet: [NSCharacterSet characterSetWithCharactersInString:[newFileName substringToIndex:1]]]) {
            UIAlertView *alert=[[UIAlertView alloc]initWithTitle:@"Error" message:[NSString stringWithFormat:@"File name should start with a alphabetic letter."] delegate:self cancelButtonTitle:@"Cancel" otherButtonTitles:@"Create", nil];
            alert.alertViewStyle=UIAlertViewStylePlainTextInput;
            UITextField *textField=[alert textFieldAtIndex:0];
            textField.text=[@"sketch_" stringByAppendingString:newFileName];
            [alert show];
        } else {
            //dateiname korrekt
            
            PDEFile *newFile = [[PDEFile alloc] initWithFileName:newFileName];
            [newFile saveCode:@"void setup() {\n   size(screen.width, screen.height);\n}\n\nvoid draw() {\n   background(0,0,255);\n}"];
            [pdeFiles insertObject:newFile atIndex:0];
            
            [self savePDEFileList];
            
            [table insertRowsAtIndexPaths:@[[NSIndexPath indexPathForRow:0 inSection:0]] withRowAnimation:UITableViewRowAnimationAutomatic];
        }
        
    }
}


-(BOOL) nameAlreadyExists:(NSString *) newName {
    for(PDEFile *file in pdeFiles) {
        if([file.fileName isEqualToString:newName]) {
            return true;
        }
    }
    return false;
}


-(NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 1;
}


-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return [pdeFiles count];
}

-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"pdeFileCell"];
    
    if(!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"pdeFileCell"];
    }
    
    PDEFile *file = [pdeFiles objectAtIndex:indexPath.row];
    
    cell.textLabel.text=file.fileName;
    
    return cell;
}


-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    PDEFile *selectedFile = [pdeFiles objectAtIndex:indexPath.row];
    
    PDEEditorViewController *editor = [PDEEditorViewController new];
    
    [self.navigationController pushViewController:editor animated:YES];
    
    [editor setPdeFile:selectedFile];
    
    
    
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
        [pdeFiles removeObjectAtIndex:indexPath.row];
        
        [self savePDEFileList];
        
        [table deleteRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationAutomatic];
        
    }
}

-(void) savePDEFileList {
    NSString *menuStrings = @"";
    
    for(PDEFile *file in pdeFiles) {
        menuStrings = [menuStrings stringByAppendingString:[NSString stringWithFormat:@"\n%@",file.fileName]];
    }
    
    NSString *menuFilePath = [[FileManager documentsDirectory] stringByAppendingPathComponent:@"menu.txt"];
    
    [menuStrings writeToFile:menuFilePath atomically:YES encoding:NSUTF8StringEncoding error:nil];
}

- (IBAction)about:(id)sender {
    AboutViewController* about = [AboutViewController new];
    
    UINavigationController* aboutNavController = [[UINavigationController alloc] initWithRootViewController:about];
    aboutNavController.modalTransitionStyle = UIModalTransitionStyleCoverVertical;
    aboutNavController.modalPresentationStyle = UIModalPresentationFormSheet;
    
    [self.navigationController presentViewController:aboutNavController animated:YES completion:^{
        
    }];
}


@end
