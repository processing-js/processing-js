//
//  FolderContentBrowserTableViewController.swift
//  Processing for iOS
//
//  Created by Frederik Riedel on 5/13/18.
//  Copyright © 2018 Frederik Riedel. All rights reserved.
//

import UIKit

class FolderContentBrowserTableViewController: UITableViewController, UIDocumentPickerDelegate {
    
    var contents: Array<String>
    let basePath: String
    let currentPath: String
    
    init(withPath path: String, basePath: String) {
        self.basePath = basePath
        currentPath = path
        contents =  try! FileManager.default.contentsOfDirectory(atPath: path)
        super.init(nibName: "FolderContentBrowserTableViewController", bundle: Bundle.main)
        title = "Folder Contents"
        
    }
    
    private func reload() {
        contents =  try! FileManager.default.contentsOfDirectory(atPath: currentPath)
        tableView.reloadData()
    }
    
    required init(coder decoder: NSCoder) {
        contents = Array()
        basePath = ""
        currentPath = ""
        super.init(coder: decoder)!
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        tableView.register(UINib.init(nibName: "FileContentTableViewCell", bundle: Bundle.main), forCellReuseIdentifier: "file-cell")
        navigationItem.rightBarButtonItems = [UIBarButtonItem(barButtonSystemItem: .done, target: self, action: #selector(FolderContentBrowserTableViewController.done))]
        
        self.navigationController?.setToolbarHidden(false, animated: false)
        let importToolbarItem = UIBarButtonItem(title: "Import…", style: .plain, target: self, action: #selector(FolderContentBrowserTableViewController.importFiles))
        let editToolbarItem = UIBarButtonItem(barButtonSystemItem: .edit, target: self, action: #selector(FolderContentBrowserTableViewController.importFiles))
        editToolbarItem.isEnabled = false
        let exportToolbarItem = UIBarButtonItem(barButtonSystemItem: .action, target: self, action: #selector(FolderContentBrowserTableViewController.importFiles))
        exportToolbarItem.isEnabled = false
        let flexibleSpace = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
        self.toolbarItems = [importToolbarItem, flexibleSpace, exportToolbarItem, flexibleSpace, editToolbarItem]
    }
    
    @objc func done() {
        self.dismiss(animated: true, completion: nil)
    }
    
    @objc func importFiles() {
        if #available(iOS 11.0, *) {
            UINavigationBar.appearance(whenContainedInInstancesOf: [UIDocumentBrowserViewController.self]).tintColor = nil
        }
        let filePickerViewController = UIDocumentPickerViewController(documentTypes: ["public.item"], in: .import)
        filePickerViewController.delegate = self
        filePickerViewController.popoverPresentationController?.barButtonItem = navigationItem.leftBarButtonItem;
        present(filePickerViewController, animated: true, completion: nil)
    }

    // MARK: - Table view data source

    override func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return contents.count
    }

    
    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "file-cell", for: indexPath) as! FileContentTableViewCell

        let path = "\(currentPath)/\(contents[indexPath.row])"
        cell.fileTypeNameLabel.text = contents[indexPath.row]
        
        var directory: ObjCBool = ObjCBool(false)
        let exists = FileManager.default.fileExists(atPath: path, isDirectory: &directory)
        if exists && directory.boolValue {
            cell.fileTypeIcon.image = UIImage(named: "folder")
        } else {
            cell.fileTypeIcon.image = UIImage(named: "pde-file-icon")
        }

        return cell
    }
    
    
    override func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 80
    }
    
    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let path = "\(currentPath)/\(contents[indexPath.row])"
        var directory: ObjCBool = ObjCBool(false)
        let exists = FileManager.default.fileExists(atPath: path, isDirectory: &directory)
        if exists && directory.boolValue {
            // open new folder content
            let dataFolderVC = FolderContentBrowserTableViewController(withPath: URL(string: currentPath)!.appendingPathComponent(contents[indexPath.row]).path, basePath: basePath)
            navigationController?.pushViewController(dataFolderVC, animated: true)
        } else {
            // open file inspector
        }
    }

    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentAt url: URL) {
        let destinationURL = URL(string: basePath)!.appendingPathComponent("data").appendingPathComponent(url.lastPathComponent)
        try! FileManager.default.copyItem(atPath: url.path, toPath: destinationURL.path)
        if let lastPathComponent = URL(string: currentPath)?.lastPathComponent {
            if lastPathComponent != "data" {
                let dataFolderVC = FolderContentBrowserTableViewController(withPath: URL(string: currentPath)!.appendingPathComponent("data").path, basePath: basePath)
                navigationController?.pushViewController(dataFolderVC, animated: true)
            }
        }
        reload()
    }
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
}
