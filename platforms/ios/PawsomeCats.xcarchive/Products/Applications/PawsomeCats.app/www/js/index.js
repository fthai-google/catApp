/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    tv: 'https://pawsometv.herokuapp.com/',
    mousedownY: 0,
    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
        $.mobile.loading( "hide" );
        mdc.autoInit();
        app.searchCats();
        $('.screen').click(app.closeScreen);
        // $('.screen-content').mousedown(function(event) {
        //     app.mousedownY = event.pageY;
        // });
        // $('.screen-content').mouseup(function(event) {
        //     if ((app.mousedownY - event.pageY) < 0) {
        //         app.closeScreen();
        //     }
        // });
        $('.screen-content').swipe( {
            //Generic swipe handler for all directions
            swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
              app.closeScreen();
            }
          });
        $('.mobile-button img').click(function() {
            app.clickButton($(this));
        });
        $(".comment-input").on('keyup', function (e) {
            if (e.keyCode == 13) {
                app.enterComment();
            }
        });
        $(".comment-input").on("blur","input",enterComment);
        
     
    },
    // downSwipe: function(event) {
    //     var ydiff = event.swipestart.coords[1] - event.swipestop.coords[1];
    //     console.log(event);
    //     console.log('ydiff: ' + ydiff);
    //     if (ydiff < 0) {
    //         console.log('Detected downswipe');
    //         app.closeScreen();
    //     }
    // },
    enterComment: function() {
        var c = $('.comment-input').val();
        if (c != '') {
            var data = {comment: c};
            console.log('HEYYYYYY');
            $.post( app.tv + "new-comment", data, function(data) {
              console.log('sent!!');
            });
            $('.comment-input').val('');
        }
        
    },
    swipeHandler: function(event) {
        $('.screen-container').css("display", "block");
        // $('#screen-img').attr('src', event);
        $('.screen-content').animate({opacity: 1, 'margin-top': '0px'}, 500, function() {});
        $('.screen').animate({opacity: 0.8}, 500, function() {});
        $('#screen-img').attr('src', event.data.image);
        $('#videoTitle').text(event.data.title);
        $('.channelInfo h3').text('by ' + event.data.channel);
        $('.app').addClass('no-scroll');
        $('#pause-play img').attr('id', 'pause').attr('src', 'img/pausebutton@2x.png');
        // $('.screen-content').animate({"-webkit-transform":"translate(0%,-50%)"},250,function() {console.log('done');});
        var data = {videoID: event.data.videoID};
        $.post( app.tv + "play-video", data, function(data) {
          console.log('sent!!');
        });

    },
    searchCats: function() {
        var url = 'https://www.googleapis.com/youtube/v3/search';
        var params = {
            part: 'snippet',
            key: 'AIzaSyALkI8L1un2MWYwHZ1cgiMZ2NeCfQcFG30',
            q: 'cats',
            maxResults: 10
        };
        $.getJSON(url, params, function(results) {
            app.processResults(results);
        });
    },
    processResults: function(results) {
        console.log('processing results');
        console.log(results.items.length);
        for (var i = 0; i < results.items.length; i++) {
            var value = results.items[i];
            console.log(value);
            var title = app.trimTitle(value.snippet.title);
            var fullTitle = value.snippet.title;
            var thumbnail = value.snippet.thumbnails.high.url;
            var channel = value.snippet.channelTitle;
            var cId= value.snippet.channelId;
            var id = value.id.videoId;
            var html = "<div id='" + id +"' class='thumbnail'><img src='" + thumbnail + "'><h2> "+ title +" </h2><h3> by " + channel +"</h3></div>";
            $(".results").append(html)
            $("#" + id).on('swipe', {image: thumbnail, title: fullTitle, channel: channel, videoID: id}, app.swipeHandler);
            $("#" + id).data('data', {channelId: cId});
        };
    },
    trimTitle: function(title) {
        if (title.length > 45) {
            var lastDash = title.substring(0,45).lastIndexOf('-');
            var index = title.substring(0,45).lastIndexOf(' ');
            if (lastDash != -1) {
                var index = Math.min(title.substring(0,45).lastIndexOf(' '), lastDash);
            }
            return title.substring(0,index) + "...";
        } else {
            return title;
        }
    },
    closeScreen: function() {
        $('.screen-content').animate({opacity: 0, 'margin-top': '2000px'}, 300, function() {})
         $('.comment-input').val('');
        $('.screen').animate({opacity: 0}, 150, function() {$('.screen-container').css("display", "none");});
        $('.app').removeClass('no-scroll');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    },

    clickButton: function(element) {
        var type = element.attr('id');
        if (type == 'pause') {
            element.attr('id', 'play');
            element.fadeOut(250, function() {
                element.attr('src', 'img/playbutton@2x.png');
                element.fadeIn(250);
            });
            $.post( app.tv + "pause-video", function() {
            });
        } else if (type == 'play') {
            $.post( app.tv + "resume-video", function() {
            });
            element.attr('id', 'pause');
            element.fadeOut(250, function() {
                element.attr('src', 'img/pausebutton@2x.png');
                element.fadeIn(250);
            });
            
        } else if (type == 'subscribe') {
            element.attr('id', 'unsubscribe');
            element.fadeOut(250, function() {
                element.attr('src', 'img/unsubscribebutton@2x.png');
                element.fadeIn(250);
            });
            $.post( app.tv + "subscribe", function() {
              console.log('subscribe');
            });
        } else if (type == 'unsubscribe') {
            element.attr('id', 'subscribe');
            element.fadeOut(250, function() {
                element.attr('src', 'img/subscribebutton@2x.png');
                element.fadeIn(250);
            });
            $.post( app.tv + "unsubscribe", function() {
              console.log('unsubscribe');
            });
        } else if (type == 'like') {
            element.attr('id', 'unlike');
            element.fadeOut(250, function() {
                element.attr('src', 'img/unlikebutton@2x.png');
                element.fadeIn(250);
            });
            $.post( app.tv + "like", function() {
              console.log('like');
            });
        } else if (type == 'unlike') {
            element.attr('id', 'like');
            element.fadeOut(250, function() {
                element.attr('src', 'img/likebutton@2x.png');
                element.fadeIn(250);
            });
            $.post( app.tv + "unlike", function() {
              console.log('unlike');
            });
        } else {
            alert('Clicked button with id: ' + type);
        }
    }
};

app.initialize();
