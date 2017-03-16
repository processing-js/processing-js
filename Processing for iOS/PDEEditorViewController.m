//
//  EditorViewController.m
//  Processing for iOS
//
//  Created by Frederik Riedel on 27.06.15.
//  Copyright (c) 2015 Frederik Riedel. All rights reserved.
//

#import "PDEEditorViewController.h"

@implementation PDEEditorViewController


-(void)viewDidLoad {
    [super viewDidLoad];
    
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillChange:) name:UIKeyboardWillChangeFrameNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillHide:) name:UIKeyboardWillHideNotification object:nil];
    
    
    UIBarButtonItem *runButton =  [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemPlay target:self action:@selector(runSketch)];
    
    
    UIBarButtonItem *formatButton = [[UIBarButtonItem alloc] initWithTitle:@"Format" style:UIBarButtonItemStylePlain target:self action:@selector(formatCode)];
    
    self.navigationItem.rightBarButtonItems=@[runButton,formatButton];
    
    self.editor.text = [self.pdeFile loadCode];
    
    
    [self highlightCode];
    [self codeLineIndent];
    
    
    
    
    
    
}

-(NSArray<UIKeyCommand *> *)keyCommands {
    
    UIKeyCommand* format = [UIKeyCommand keyCommandWithInput:@"t" modifierFlags:UIKeyModifierCommand action:@selector(formatCode) discoverabilityTitle:@"Format Code"];
    UIKeyCommand* run = [UIKeyCommand keyCommandWithInput:@"r" modifierFlags:UIKeyModifierCommand action:@selector(runSketch) discoverabilityTitle:@"Run Code"];
    UIKeyCommand* close = [UIKeyCommand keyCommandWithInput:@"w" modifierFlags:UIKeyModifierCommand action:@selector(close) discoverabilityTitle:@"Close Project"];
    UIKeyCommand *esc = [UIKeyCommand keyCommandWithInput: UIKeyInputEscape modifierFlags: 0 action: @selector(close) discoverabilityTitle:@"Close Project"];
    
    return @[format, run, close, esc];
}

-(void) close {
    [self.navigationController popViewControllerAnimated:YES];
}


-(void) setPdeFile:(PDEFile *)pdeFile {
    _pdeFile = pdeFile;
    
    self.title=[NSString stringWithFormat:@"%@.pde",self.pdeFile.fileName];
}




-(void) runSketch {
    
    [self.pdeFile saveCode:self.editor.text];
    
    RunSketchViewController *sketchViewController = [[RunSketchViewController alloc] initWithPDEFile:self.pdeFile];
    
    [self.navigationController pushViewController:sketchViewController animated:YES];
}

-(void) formatCode {
    
    NSArray *codeLines = [self.editor.text componentsSeparatedByString:@"\n"];
    
    NSInteger codeLevel[codeLines.count];
    
    int currentCodeLevel = 0;
    int currentLine = 0;
    
    for(NSString *lineOfCode in codeLines) {
        NSRange range = [lineOfCode rangeOfString:@"^\\s*" options:NSRegularExpressionSearch];
        NSString *result = [lineOfCode stringByReplacingCharactersInRange:range withString:@""];
        
        range = [result rangeOfString:@"\\s*$" options:NSRegularExpressionSearch];
        result = [result stringByReplacingCharactersInRange:range withString:@""];
        
        if(result.length>0) {
            NSString *firstChar = [result substringToIndex:1];
            NSString *lastChar = [result substringFromIndex:result.length-1];
            
            
            if([firstChar isEqualToString:@"{"] || [lastChar isEqualToString:@"{"]) {
                codeLevel[currentLine] = currentCodeLevel;
                currentCodeLevel++;
            } else if([firstChar isEqualToString:@"}"]) {
                currentCodeLevel--;
                codeLevel[currentLine] = currentCodeLevel;
            } else {
                codeLevel[currentLine] = currentCodeLevel;
            }
        } else {
            codeLevel[currentLine] = currentCodeLevel;
        }
        
        currentLine++;
    }
    
    currentLine = 0;
    
    NSMutableArray *resultCodeLines = [[NSMutableArray alloc] init];
    
    for(NSString *lineOfCode in codeLines) {
        NSRange range = [lineOfCode rangeOfString:@"^\\s*" options:NSRegularExpressionSearch];
        NSString *result = [lineOfCode stringByReplacingCharactersInRange:range withString:@""];
        
        NSString *whitespaces = @"";
        
        for(int i=0; i < codeLevel[currentLine]; i++) {
            whitespaces = [NSString stringWithFormat:@"%@   ",whitespaces];
        }
        
        result = [NSString stringWithFormat:@"%@%@",whitespaces,result];
        [resultCodeLines addObject:result];
        
        currentLine++;
    }
    
    NSString *autoFormattedCode = [resultCodeLines componentsJoinedByString:@"\n"];
    
    CGPoint contentOffset = self.editor.contentOffset;
    self.editor.scrollEnabled=NO;
    NSRange currentCurserPosition = self.editor.selectedRange;
    
    self.editor.text=autoFormattedCode;
    
    self.editor.selectedRange = currentCurserPosition;
    self.editor.scrollEnabled=YES;
    [[NSOperationQueue mainQueue] addOperationWithBlock: ^{
        [self.editor setContentOffset: contentOffset animated:NO];
    }];
    
    [self highlightCode];
    [self codeLineIndent];
}

-(void) codeLineIndent {
    NSMutableAttributedString * string = [[NSMutableAttributedString alloc] initWithAttributedString:self.editor.attributedText];
    [string addAttribute:NSFontAttributeName value:[UIFont fontWithName:@"SourceCodePro-Regular" size:18] range:NSMakeRange(0, string.length)];
    
    NSMutableParagraphStyle *style = [[NSParagraphStyle defaultParagraphStyle] mutableCopy];
    style.headIndent = 32;
    NSDictionary *attributes = @{
                                 NSParagraphStyleAttributeName: style
                                 };
    
    [string addAttributes:attributes range:NSMakeRange(0, string.length)];
    
    CGPoint contentOffset = self.editor.contentOffset;
    self.editor.scrollEnabled=NO;
    NSRange currentCurserPosition = self.editor.selectedRange;
    
    [self.editor setAttributedText:string];
    
    self.editor.selectedRange = currentCurserPosition;
    self.editor.scrollEnabled=YES;
    [[NSOperationQueue mainQueue] addOperationWithBlock: ^{
        [self.editor setContentOffset: contentOffset animated:NO];
    }];}


-(void) highlightCode {
    
    if(self.editor.text) {
        NSMutableAttributedString * string = [[NSMutableAttributedString alloc] initWithString:self.editor.text];
        [string addAttribute:NSFontAttributeName value:[UIFont fontWithName:@"SourceCodePro-Regular" size:18] range:NSMakeRange(0, string.length)];
        
        
        for(NSDictionary *syntaxPattern in [FileManager syntaxHighlighterDictionary]) {
            NSString *patternString = syntaxPattern[@"regex"];
            
            //        patternString=@"";
            
            
            
            NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:patternString options:NSRegularExpressionCaseInsensitive error:NULL];
            
            NSArray *matchResults = [regex matchesInString:self.editor.text options:0 range:NSMakeRange(0, self.editor.text.length)];
            
            //es kann bei richtigen matches nur ein match geben
            
            for(NSTextCheckingResult *match in matchResults) {
                NSRange matchRange = [match range];
                
                CGFloat red = [[syntaxPattern[@"color"] componentsSeparatedByString:@","][0] floatValue]/255;
                CGFloat green = [[syntaxPattern[@"color"] componentsSeparatedByString:@","][1] floatValue]/255;
                CGFloat blue = [[syntaxPattern[@"color"] componentsSeparatedByString:@","][2] floatValue]/255;
                
                
                [string addAttribute:NSForegroundColorAttributeName value:[UIColor colorWithRed:red green:green blue:blue alpha:1.f] range:matchRange];
                
                if(syntaxPattern[@"bold"]) {
                    [string addAttribute:NSFontAttributeName value:[UIFont fontWithName:@"SourceCodePro-Semibold" size:18] range:matchRange];
                } else {
                    [string addAttribute:NSFontAttributeName value:[UIFont fontWithName:@"SourceCodePro-Regular" size:18] range:matchRange];
                }
                
            }
            
        }
        
        
        
        
        
        //Cursorposition speichern
        CGPoint contentOffset = self.editor.contentOffset;
                
        self.editor.scrollEnabled=NO;
        NSRange currentCurserPosition = self.editor.selectedRange;
        
        [self.editor setAttributedText:string];
        
        self.editor.selectedRange = currentCurserPosition;
        
        
        [self.editor setContentOffset: contentOffset animated:NO];
        
        
        self.editor.scrollEnabled=YES;
        
    }
}

- (void)keyboardWillChange:(NSNotification *)notification {
    
    
    
    [UIView beginAnimations:nil context:NULL];
    [UIView setAnimationDuration:[notification.userInfo[UIKeyboardAnimationDurationUserInfoKey] doubleValue]];
    [UIView setAnimationCurve:[notification.userInfo[UIKeyboardAnimationCurveUserInfoKey] integerValue]];
    [UIView setAnimationBeginsFromCurrentState:YES];
    
    NSDictionary* info = [notification userInfo];
    CGRect keyboardRect = [self.editor convertRect:[[info objectForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue] fromView:nil];
    CGSize keyboardSize = keyboardRect.size;
    
    
    self.editor.contentInset = UIEdgeInsetsMake(0, 0, keyboardSize.height, 0);
    self.editor.scrollIndicatorInsets = self.editor.contentInset;
    
    
    
    
    [UIView commitAnimations];
    
}

- (void)keyboardWillHide:(NSNotification *)notification {
    
    [UIView beginAnimations:nil context:NULL];
    [UIView setAnimationDuration:[notification.userInfo[UIKeyboardAnimationDurationUserInfoKey] doubleValue]];
    [UIView setAnimationCurve:[notification.userInfo[UIKeyboardAnimationCurveUserInfoKey] integerValue]];
    [UIView setAnimationBeginsFromCurrentState:YES];
    
    
    self.editor.contentInset = UIEdgeInsetsZero;
    self.editor.scrollIndicatorInsets = UIEdgeInsetsZero;
    
    
    
    
    
    
    [UIView commitAnimations];
    
}

-(void) viewWillDisappear:(BOOL)animated {
    if ([self.navigationController.viewControllers indexOfObject:self]==NSNotFound) {
        [self.pdeFile saveCode:self.editor.text];
    }
    [super viewWillDisappear:animated];
}



-(void)textViewDidChange:(UITextView *) textView {
    [self highlightCode];
    [self codeLineIndent];
}

-(BOOL)canBecomeFirstResponder {
    return YES;
}



@end
