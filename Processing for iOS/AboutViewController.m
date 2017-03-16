//
//  AboutViewController.m
//  Processing for iOS
//
//  Created by Frederik Riedel on 17.02.17.
//  Copyright © 2017 Frederik Riedel. All rights reserved.
//

#import "AboutViewController.h"
@import SafariServices;

@interface AboutViewController ()

@end

@implementation AboutViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    self.title = @"About Processing for iOS";
    
    UIBarButtonItem* done = [[UIBarButtonItem alloc] initWithTitle:@"Done" style:UIBarButtonItemStyleDone target:self action:@selector(done)];
    self.navigationItem.rightBarButtonItem = done;
}

-(void) done {
    [self dismissViewControllerAnimated:YES completion:^{
        
    }];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)openTwitter:(id)sender {
    
    SFSafariViewController *sfvc = [[SFSafariViewController alloc] initWithURL:[NSURL URLWithString:@"https://twitter.com/frederikriedel"]];

    [self presentViewController:sfvc animated:YES completion:nil];
    
    
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"twitter://user?screen_name=frederikriedel"]];

}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
