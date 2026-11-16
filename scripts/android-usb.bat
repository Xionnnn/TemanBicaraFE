@echo off
setlocal

set "ADB_EXE=%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe"

if not exist "%ADB_EXE%" (
    echo ERROR: adb.exe was not found. Update ADB_EXE in this script.
    goto failed
)

echo Checking the USB-connected Android phone...
"%ADB_EXE%" -d get-state
if errorlevel 1 goto failed

echo Forwarding Metro port 8081...
"%ADB_EXE%" -d reverse tcp:8081 tcp:8081
if errorlevel 1 goto failed

echo Forwarding API port 5210...
"%ADB_EXE%" -d reverse tcp:5210 tcp:5210
if errorlevel 1 goto failed

echo.
"%ADB_EXE%" -d reverse --list
if errorlevel 1 goto failed

echo.
echo USB forwarding is ready. Start your API and Expo as usual.
pause
exit /b 0

:failed
echo.
echo USB setup failed. Check the error above, connect one phone,
echo enable USB debugging, and accept the authorization prompt.
pause
exit /b 1
