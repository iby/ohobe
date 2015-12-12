# Ohobe

A collection of "Oh Adobe…" moments compiled into some useful scripts. The paramount of all is the Exporter that was mostly inspired by existing popular scripts. The best part of this all:

* Neat modular architecture with MVC flavour.
* Predefined constants / enums and useful utilities.
* Awesome json configuration savable into xmp.
* ES5 shim.
* Gulp + Webpack build.

I hope this would be a good starting point for people who want to work with Adobe Scripting, but don't know the best way of jumping into this bog. The best documentation and resources, most outdated and partially not reflecting the reality:

* Theunis de Jong's [Adobe Illustrator CS6 Type Library](http://jongware.mit.edu/iljscs6html/iljscs6/index.html) and the [amazing index page](http://jongware.mit.edu/iljscs6html/iljscs6/inxx.html)
* [Adobe Developer Connection](http://www.adobe.com/devnet.html)
* [Adobe Scripting Center](http://www.adobe.com/devnet/scripting.html)

:neckbeard: PRs and contributions are very welcome!

## Exporter

This is work in progress. Allows to export artboards, layers and symbols with a big range of configuration, including selections, scaling for retina displays or icons or anything else, and prefixes.

<div align="center"><img src="/documentation/asset/exporter-screenshot.png"></div>

## Afterword

This is the coming out on my love-hate relationship with Adobe and Illustrator in particular. We live in the beautiful and amazing time of technological revolution where Adobe is one of the biggest and most renown software companies and one of the best examples how being a monopoly can fuck things up big time. Fortunately, guys like Sketch and Affinity are taking the initiative and doing something decent making the behemoth to move. Unfortunately, it will take years before many can make a switch without looking back. Being one of them I decided to optimise my workflow with a bunch of scripts that most of us wish were the native features.

As this proved to be a very unhealthy experience I took the opportunity to ramble in a very unprofessional way throughout my code. Hopefully someone at Adobe will agree on a few points and maybe will update the fucking 15+ years old JavaScript engine to, say, ES5… or at least upload a decent documentation so that everyone would be on the same page.
