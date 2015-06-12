# Owl Charger &#9790;

A _former_ [node-webkit](http://nwjs.io/) playground project to reduce YOUR carboon footprint :) 
-----------------------------------------------------------------------------

I wanted to play with NW as it seemed interesting so I thought that I should try to deliver something _useful_ while I do it.

As I worked sometime ago around the energy industry I am aware of the reduced tariffs most of electrity companies provides despite are still _unknwon_ for most of the public. These tariffs exists because efficiency reasons (you cannot disconnect a power plant during night time etc.) and leveraging that is both cost effective and environementally friendly. For example in the UK this tariff is called [Economy 7](https://en.wikipedia.org/wiki/Economy_7) while in Spain is known as [Tarifa con discrimnacion horaria DH](https://es.wikipedia.org/wiki/Tarifa_el%C3%A9ctrica_con_discriminaci%C3%B3n_horaria). You can get __discountted prices up to 65%__ but your milleage may vary depending on which [country you live](http://ec.europa.eu/eurostat/web/energy/data/main-tables). 

The idea rather than saving some cents with the _ridiculous_ consumption modern laptops have (you might save barely 1€ monthly) was to have some positive impact on our environment __reducing our carboon footprint__.

Searching for some existing tool that might alredy exist I couldn't find any so I decided to do it.

Purpose
------------
Monitor battery status and current time to minimize the electricity consumption within the tariff peak times (more expensive period) and try to charge the laptop mostly during off-peak time for a reduced carbon footprint.

Disclaimer
--------------
Current development focus is for MacBook's because its long lasting batteries. Debian based distros support is planned though.


## Features
* 2.0DHA Spanish tariff support. Unfinished
* 80%-40% charge cycles notifications
* ~~Debian distros based support~~


Side functionality
------------------
By the way I found that Cadex Electronics CEO Isidor Buchmann told [WIRED.COM](http://www.wired.com/2013/09/laptop-battery/) that ideally everyone would charge their batteries to 80 percent then let them drain to about 40 percent. This will prolong the life of your battery. If you are interested you can read [further](http://batteryuniversity.com/learn/article/how_to_prolong_lithium_based_batteries'). 

I provide some functionality to support this idea but that's __not__ the app purpose,  I might remove or mix-in this extra functionality, I am unsure. Anyway there are a few nice free tools that get you covered, just google for them. :)



## Install

To be completed, for now clone the repo and follow these [instructions](https://github.com/nwjs/nw.js/wiki/How-to-package-and-distribute-your-apps)

## Known limitations

A lot! Contributions welcome!

## To be done


* Define nice jasmine tests and setup Travis
* Make tarifs easily editable through UI
* Any ideas? :)




Made with ❤ in Spain

