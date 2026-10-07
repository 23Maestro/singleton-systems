import AppKit
import ApplicationServices
import ServiceManagement
import Foundation

struct AgentDiagnostics: Encodable {
    let apiVersion = 1
    let bundleIdentifier: String?
    let processIdentifier: Int32
    let trackingEnabled = false
    let accessibilityTrusted: Bool
    let loginStatus: String
    let loginLaunchEnabled: Bool
}

@MainActor
func diagnostics() -> AgentDiagnostics {
    let loginStatus: String
    switch SMAppService.mainApp.status {
    case .notRegistered: loginStatus = "notRegistered"
    case .enabled: loginStatus = "enabled"
    case .requiresApproval: loginStatus = "requiresApproval"
    case .notFound: loginStatus = "notFound"
    @unknown default: loginStatus = "unknown"
    }
    return AgentDiagnostics(
        bundleIdentifier: Bundle.main.bundleIdentifier,
        processIdentifier: ProcessInfo.processInfo.processIdentifier,
        accessibilityTrusted: AXIsProcessTrusted(),
        loginStatus: loginStatus,
        loginLaunchEnabled: SMAppService.mainApp.status == .enabled
    )
}

@MainActor
final class AgentDelegate: NSObject, NSApplicationDelegate {
    private var statusItem: NSStatusItem?

    func applicationDidFinishLaunching(_ notification: Notification) {
        let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        item.button?.image = NSImage(systemSymbolName: "clock", accessibilityDescription: "Business Time Agent")
        let menu = NSMenu()
        let state = NSMenuItem(title: "Tracking off", action: nil, keyEquivalent: "")
        state.isEnabled = false
        menu.addItem(state)
        menu.addItem(.separator())
        menu.addItem(NSMenuItem(title: "Quit Business Time Agent", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        item.menu = menu
        statusItem = item
    }
}

if Array(CommandLine.arguments.dropFirst()) == ["diagnostics"] {
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.sortedKeys]
    FileHandle.standardOutput.write(try encoder.encode(diagnostics()))
    FileHandle.standardOutput.write(Data("\n".utf8))
} else if CommandLine.arguments.count == 1 {
    let app = NSApplication.shared
    let delegate = AgentDelegate()
    app.delegate = delegate
    app.setActivationPolicy(.accessory)
    app.run()
} else {
    FileHandle.standardError.write(Data("{\"apiVersion\":1,\"code\":\"unsupported_command\"}\n".utf8))
    exit(64)
}
