//
//  EditorTabViewController.swift
//  Processing for iOS
//
//  Created by Frederik Riedel on 5/16/18.
//  Copyright © 2018 Frederik Riedel. All rights reserved.
//

import UIKit
import Tabman
import Pageboy
import SafariServices

class EditorTabViewController: TabmanViewController, PageboyViewControllerDataSource {
    
    let project: PDESketch!
    
    init(withProject project: PDESketch) {
        self.project = project
        super.init(nibName: "EditorTabViewController", bundle: Bundle.main)
        self.automaticallyAdjustsChildScrollViewInsets = true
        self.dataSource = self
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.bar.style = .scrollingButtonBar
        
        self.title = self.project.sketchName
        
        let runButton = UIBarButtonItem(barButtonSystemItem: .play, target: self, action: #selector(EditorTabViewController.runSketch))
        let addNewPDEFile = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(EditorTabViewController.addNewPDEFile))
        self.navigationItem.rightBarButtonItems = [runButton, addNewPDEFile]
        
        
        let formatButton = UIBarButtonItem(title: "Format Code", style: .plain, target: self, action: #selector(EditorTabViewController.formatCode))
        let codeReferenceButton = UIBarButtonItem(title: "Reference", style: .plain, target: self, action: #selector(EditorTabViewController.showCodeReference))
        let flexibleSpace = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
        let organize = UIBarButtonItem(barButtonSystemItem: .organize, target: self, action: #selector(EditorTabViewController.showFolderContent))
        
        self.toolbarItems = [formatButton,flexibleSpace,organize,flexibleSpace,codeReferenceButton]
        
        NotificationCenter.default.addObserver(self, selector: #selector(EditorTabViewController.saveCode), name: NSNotification.Name(rawValue: "saveCode"), object: nil)
        
        self.bar.appearance = TabmanBar.Appearance({ (appearance) in
            
            // customize appearance here
            appearance.state.selectedColor = UIColor.white
            appearance.state.color = UIColor.white
            appearance.style.background = .solid(color: UIColor.processing())
            appearance.indicator.color = UIColor.white
            //appearance.state.color = UIColor.processing()
            appearance.indicator.isProgressive = false
        })
        
        reloadBarTitles()
    }
    
    func reloadBarTitles() {
        var titles = Array<Item>()
        for pdeFile in project.pdeFiles {
            titles.append(Item(title: "\(pdeFile.fileName!).pde"))
        }
        self.bar.items = titles
    }
    
    func numberOfViewControllers(in pageboyViewController: PageboyViewController) -> Int {
        return project.pdeFiles.count
    }
    
    func viewController(for pageboyViewController: PageboyViewController, at index: PageboyViewController.PageIndex) -> UIViewController? {
        return PDEEditorViewController(pdeSketch: project.pdeFiles![index])
    }
    
    func defaultPage(for pageboyViewController: PageboyViewController) -> PageboyViewController.Page? {
        return .first
    }
    
    
    
    override var keyCommands: [UIKeyCommand]? {
        return [
            UIKeyCommand(input: "t", modifierFlags: .command, action: #selector(EditorTabViewController.formatCode), discoverabilityTitle: "Format Code"),
            UIKeyCommand(input: "r", modifierFlags: .command, action: #selector(EditorTabViewController.runSketch), discoverabilityTitle: "Run Code"),
            UIKeyCommand(input: "w", modifierFlags: .command, action: #selector(EditorTabViewController.close), discoverabilityTitle:"Close Project"),
            UIKeyCommand(input: UIKeyInputEscape, modifierFlags: UIKeyModifierFlags(rawValue: 0), action: #selector(EditorTabViewController.close), discoverabilityTitle:"Close Project")
        ]
    }
    
    @objc func close() {
        self.navigationController?.popViewController(animated: true)
    }
    
    @objc func showCodeReference() {
        let safariVC = SFSafariViewController(url: URL(string: "https://processing.org/reference/")!)
        navigationController?.pushViewController(safariVC, animated: true)
    }
    
    @objc func runSketch() {
        saveCode()
        
        // Todo: put all PDE files / classes in one big file and run this then
        let runVC = RunSketchViewController(pdeFile: project)!
        navigationController?.pushViewController(runVC, animated: true)
    }
    
    @objc func formatCode() {
        let pdeFileViewController = currentViewController as! PDEEditorViewController
        pdeFileViewController.formatCode()
    }
    
    @objc func saveCode() {
        let pdeFileViewController = currentViewController as! PDEEditorViewController
        pdeFileViewController.saveCode()
    }
    
    @objc func showFolderContent() {
        let folderContenVC = FolderContentBrowserTableViewController(withPath: self.project.filePath(), basePath: self.project.filePath())
        let navC = ProcessingNavigationViewController(rootViewController: folderContenVC)
        navigationController?.present(navC, animated: true, completion: nil)
        
    }
    
    @objc func addNewPDEFile() {
        let newPDEFile = PDEFile(fileName: "haha", partOf: project)
        newPDEFile?.saveCode("void setup() {\n   size(screen.width, screen.height);\n}\n\nvoid draw() {\n   background(0,0,255);\n}")
        self.reloadPages()
        reloadBarTitles()
    }
}

