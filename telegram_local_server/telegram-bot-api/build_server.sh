#!/bin/bash
if [ -e /usr/local/bin/telegram-bot-api ]
then
echo "Сервер собран"
else
echo "Сервер не собран"
cd /src/telegram-bot-api
rm -rf build
mkdir build
cd build
CXXFLAGS="-stdlib=libc++" CC=/usr/bin/clang-14 CXX=/usr/bin/clang++-14 cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX:PATH=/usr/local ..
cmake --build . --target install
fi