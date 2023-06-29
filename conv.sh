#!/bin/bash
cd out
for i in $( find src -name '*.js'); do
    awk -f ../nls.awk $i > $i.t
    mv $i.t $i
done