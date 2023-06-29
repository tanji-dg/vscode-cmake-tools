/nls\.config/ {
     sub("\\.[^.]+$", "", FILENAME);
     printf "nls.config({ messageFormat: nls.MessageFormat.bundle, bundleFormat: nls.BundleFormat.standalone })(__filename, \"%s\");\n", FILENAME;
     next
}
/nls\.loadMessageBundle/ {
     sub("\\.[^.]+$", "", FILENAME);
     printf "const localize = nls.loadMessageBundle(__filename, \"%s\");\n", FILENAME;
     next
}
{
    print
}