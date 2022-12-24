; ! is the Alt key
; ^ is the Control key 
; + is the Shift key
; # is the win key

; win + x to send alt + f7
#x::
send {altdown}{f7}{altup}
return

; ctrl + alt + n to send ctrl + shift + t
^!n::
send {ctrldown}{shiftdown}{t}{ctrlup}{shiftup}
; MsgBox, You pressed ctrl + alt + n
return

; shift + F2
+f2::
MsgBox, You pressed shift + F2
return

; Type "abc" to send "Hello"
:*:abc::
sendraw, hello world!
return