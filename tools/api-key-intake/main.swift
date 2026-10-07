import AppKit
import Foundation
import Security
import Darwin

// All values enter through stdin or a secure local form, never command arguments.
struct Destination {
    let service: String
    let account: String
}

let aliases: [String: Destination] = [
    "SCRAPECREATORS_API_KEY": Destination(service: "com.singleton-systems.scrapecreators", account: "singleton23"),
    "BRAVE_SEARCH_API_KEY": Destination(service: "singleton-systems.brave-search-api", account: "codex"),
    "SERPAPI_API_KEY": Destination(service: "singleton-systems.serpapi-api", account: "codex"),
    "CALCOM_API_KEY": Destination(service: "singleton-systems.calcom-api", account: "codex"),
    "UPWORK_CLIENT_ID": Destination(service: "com.singleton-systems.upwork.oauth.client-id", account: "singleton-systems"),
    "UPWORK_CLIENT_SECRET": Destination(service: "com.singleton-systems.upwork.oauth.client-secret", account: "singleton-systems")
]

func destination(_ name: String) -> Destination {
    aliases[name.uppercased()] ?? Destination(service: "com.singleton-systems.api-keys.\(name)", account: "singleton23")
}

func validName(_ name: String) -> Bool {
    name.range(of: "^[A-Za-z][A-Za-z0-9_.-]{0,127}$", options: .regularExpression) != nil
}

func reply(_ status: String, _ name: String = "", _ message: String = "") -> [String: Any] {
    var result: [String: Any] = ["status": status, "name": name]
    if validName(name) {
        let target = destination(name)
        result["service"] = target.service
        result["account"] = target.account
    }
    if !message.isEmpty { result["message"] = message }
    return result
}

func emit(_ result: [String: Any]) {
    if let data = try? JSONSerialization.data(withJSONObject: result, options: [.sortedKeys]),
       let text = String(data: data, encoding: .utf8) { print(text) }
}

func keychainError(_ code: OSStatus) -> String {
    // Never include request input in diagnostics.
    if code == errSecInteractionNotAllowed || code == errSecAuthFailed {
        return "Unlock the Mac login Keychain, then try again."
    }
    return "Keychain operation failed (\(code))."
}

func saveUsingSecurity(_ target: Destination, name: String, value: String, replace: Bool, keychain: SecKeychain) -> Bool {
    var state: SecKeychainStatus = 0
    guard SecKeychainGetStatus(keychain, &state) == errSecSuccess,
          state & kSecUnlockStateStatus != 0 else { return false }
    // The interactive CLI receives hex bytes through a private stdin pipe.
    // No secret enters argv, a shell, a temporary file, or command output.
    func quote(_ text: String) -> String {
        "\"" + text.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\"") + "\""
    }
    let path = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Library/Keychains/login.keychain-db").path
    let hex = value.utf8.map { String(format: "%02x", $0) }.joined()
    let update = replace ? " -U" : " -T /usr/bin/security"
    let command = "add-generic-password -a \(quote(target.account)) -s \(quote(target.service)) -l \(quote(name)) -X \(hex)\(update) \(quote(path))\n"
    let child = Process()
    child.executableURL = URL(fileURLWithPath: "/usr/bin/security")
    child.arguments = ["-i"]
    let pipe = Pipe()
    child.standardInput = pipe
    child.standardOutput = FileHandle.nullDevice
    child.standardError = FileHandle.nullDevice
    do {
        try child.run()
        try pipe.fileHandleForWriting.write(contentsOf: Data(command.utf8))
        try pipe.fileHandleForWriting.close()
    } catch {
        if child.isRunning { child.terminate() }
        return false
    }
    let deadline = Date().addingTimeInterval(8)
    while child.isRunning && Date() < deadline { Thread.sleep(forTimeInterval: 0.02) }
    if child.isRunning { child.terminate(); return false }
    return child.terminationStatus == 0
}

func handle(_ input: [String: Any], keychain: SecKeychain) -> [String: Any] {
    guard let rawName = input["name"] as? String else { return reply("error", "", "A key name is required.") }
    let name = rawName.trimmingCharacters(in: .whitespacesAndNewlines)
    guard validName(name) else { return reply("error", "", "Use letters, numbers, underscores, dots or hyphens for the name.") }
    let target = destination(name)
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: target.service,
        kSecAttrAccount as String: target.account,
        kSecMatchSearchList as String: [keychain]
    ]
    var check = query
    check[kSecReturnAttributes as String] = true
    check[kSecMatchLimit as String] = kSecMatchLimitOne
    let found = SecItemCopyMatching(check as CFDictionary, nil)
    guard found == errSecSuccess || found == errSecItemNotFound else {
        return reply("error", name, keychainError(found))
    }
    let operation = input["operation"] as? String ?? "save"
    if operation == "check" { return reply(found == errSecSuccess ? "exists" : "missing", name) }
    guard operation == "save" else { return reply("error", name, "Unsupported operation.") }
    guard let value = input["value"] as? String,
          !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
          value.utf8.count <= 1536 else { return reply("error", name, "Enter a nonempty API key (up to 1,536 bytes).") }
    if found == errSecSuccess && (input["replace"] as? Bool != true) { return reply("exists", name) }
    let saved = saveUsingSecurity(target, name: name, value: value, replace: found == errSecSuccess, keychain: keychain)
    return saved ? reply("saved", name) : reply("error", name, "Could not save. Check that the Mac login Keychain is unlocked and permits Apple's security tool.")
}

func openLoginKeychain() -> SecKeychain? {
    let path = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Library/Keychains/login.keychain-db").path
    var keychain: SecKeychain?
    let code = SecKeychainOpen(path, &keychain)
    if code != errSecSuccess { emit(reply("error", "", keychainError(code))) }
    return keychain
}

func alert(_ title: String, _ detail: String, buttons: [String] = ["OK"]) -> NSApplication.ModalResponse {
    let panel = NSAlert()
    panel.messageText = title
    panel.informativeText = detail
    for button in buttons { panel.addButton(withTitle: button) }
    return panel.runModal()
}

func interactive(_ keychain: SecKeychain) {
    NSApplication.shared.setActivationPolicy(.accessory)
    NSApplication.shared.activate(ignoringOtherApps: true)
    let panel = NSAlert()
    panel.messageText = "Save API Key"
    panel.informativeText = "Mac login Keychain"
    panel.addButton(withTitle: "Save")
    panel.addButton(withTitle: "Cancel")
    let form = NSView(frame: NSRect(x: 0, y: 0, width: 360, height: 92))
    let name = NSTextField(frame: NSRect(x: 0, y: 56, width: 360, height: 26))
    name.placeholderString = "Key name"
    let value = NSSecureTextField(frame: NSRect(x: 0, y: 12, width: 360, height: 26))
    value.placeholderString = "Paste API key"
    form.addSubview(name)
    form.addSubview(value)
    name.nextKeyView = value
    panel.accessoryView = form
    panel.window.initialFirstResponder = name
    guard panel.runModal() == .alertFirstButtonReturn else { print("Cancelled"); return }
    var input: [String: Any] = ["name": name.stringValue, "value": value.stringValue]
    var result = handle(input, keychain: keychain)
    if result["status"] as? String == "exists" {
        guard alert("Replace existing key?", name.stringValue, buttons: ["Replace", "Cancel"]) == .alertFirstButtonReturn else {
            value.stringValue = ""
            print("Cancelled")
            return
        }
        input["replace"] = true
        result = handle(input, keychain: keychain)
    }
    value.stringValue = ""
    input.removeValue(forKey: "value")
    if result["status"] as? String == "saved" { print("Saved: \(result["name"] as? String ?? "")") }
    else {
        let message = result["message"] as? String ?? "Key was not saved."
        _ = alert("Could not save", message)
        print(message)
        exit(1)
    }
}

let args = Array(CommandLine.arguments.dropFirst())
guard args == ["--interactive"] || args == ["--stdin"] || (args.count == 2 && args[0] == "--check") else {
    print("Usage: api-key-intake --interactive | --stdin | --check NAME")
    exit(2)
}
// Remote runs must fail cleanly rather than waiting for a Keychain dialog.
SecKeychainSetUserInteractionAllowed(args == ["--interactive"])
guard let keychain = openLoginKeychain() else { exit(1) }
if args == ["--interactive"] { interactive(keychain) }
else if args.first == "--check" { emit(handle(["name": args[1], "operation": "check"], keychain: keychain)) }
else {
    var data = Data()
    do {
        while let chunk = try FileHandle.standardInput.read(upToCount: 4096), !chunk.isEmpty {
            data.append(chunk)
            if data.count > 65536 { break }
        }
    } catch {
        emit(reply("error", "", "Could not read request."))
        exit(1)
    }
    guard data.count <= 65536,
          let input = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
        emit(reply("error", "", "Invalid request."))
        exit(1)
    }
    if ProcessInfo.processInfo.environment["SSH_CONNECTION"] != nil {
        // SSH has a separate Keychain security session. Submit the request to
        // the per-user login-session agent through its private Unix socket.
        let path = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Library/Application Support/Singleton Systems/api-key-intake/intake.sock").path
        var address = sockaddr_un()
        address.sun_family = sa_family_t(AF_UNIX)
        let bytes = Array(path.utf8) + [0]
        guard bytes.count <= MemoryLayout.size(ofValue: address.sun_path) else { emit(reply("error", "", "Intake socket path is too long.")); exit(1) }
        withUnsafeMutableBytes(of: &address.sun_path) { buffer in buffer.copyBytes(from: bytes) }
        address.sun_len = UInt8(MemoryLayout<sockaddr_un>.size)
        let fd = socket(AF_UNIX, SOCK_STREAM, 0)
        guard fd >= 0 else { emit(reply("error", "", "Could not open intake connection.")); exit(1) }
        let connected = withUnsafePointer(to: &address) { pointer in
            pointer.withMemoryRebound(to: sockaddr.self, capacity: 1) { connect(fd, $0, socklen_t(MemoryLayout<sockaddr_un>.size)) }
        }
        guard connected == 0 else { close(fd); emit(reply("error", "", "Mac intake agent is unavailable. Log into the Mac and try again.")); exit(1) }
        var timeout = timeval(tv_sec: 15, tv_usec: 0)
        _ = setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &timeout, socklen_t(MemoryLayout<timeval>.size))
        let connection = FileHandle(fileDescriptor: fd, closeOnDealloc: true)
        do {
            try connection.write(contentsOf: data)
            shutdown(fd, SHUT_WR)
            guard let response = try connection.readToEnd(), response.count <= 8192,
                  let result = try JSONSerialization.jsonObject(with: response) as? [String: Any] else { throw NSError(domain: "Intake", code: 1) }
            emit(result)
        } catch { emit(reply("error", "", "Mac intake agent did not complete the request.")); exit(1) }
        exit(0)
    }
    emit(handle(input, keychain: keychain))
}
