' SAIME Fingerprint Bridge - hidden launcher for bridge-watchdog.bat
Set WshShell = CreateObject("WScript.Shell")
p = WshShell.ExpandEnvironmentStrings("%APPDATA%\SAIME\FingerprintBridge\bridge-watchdog.bat")
WshShell.Run "cmd.exe /c """ & p & """", 0, False
