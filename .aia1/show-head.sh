#!/usr/bin/env bash
# عرض أول 8 سطور من about.html داخل مجلد .aia1
head -n 8 "$(dirname "$0")/about.html"
