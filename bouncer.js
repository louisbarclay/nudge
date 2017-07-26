// Copyright 2016, Nudge, All rights reserved.

<div class="loadingContainer">
    <div class="ball1"></div>
    <div class="ball2"></div>
    <div class="ball3"></div>
</div>

.loadingContainer {
    position:relative;
    margin:100px auto 0 auto;
    padding-top:60px;
    width:110px;
}
.loadingContainer div {
    height:20px;
    width:20px;
    border-radius:50%;
    background: black;
    float:left;
    margin:0 3px;
    background:#000000;
}
.loadingContainer .ball1 {
    z-index:1;
    -moz-animation: bounce 1s infinite ease-in-out;
    -webkit-animation: bounce 1s infinite ease-in-out;
}
.loadingContainer .ball2 {
    -moz-animation: bounce 1s infinite ease-in-out;
    -webkit-animation: bounce 1s infinite ease-in-out;
    -webkit-animation-delay: 0.5s;
    animation-delay: 0.5s;
}
.loadingContainer .ball3 {
    -moz-animation: bounce 1s infinite ease-in-out;
    -webkit-animation: bounce 1s infinite ease-in-out;
    -webkit-animation-delay: 1s;
    animation-delay: 1s;
}

@-moz-keyframes bounce {
    0%,15% {-moz-transform: translate(0,0);}
    50% {-moz-transform: translate(0,-30px);}
    85%, 100% {-moz-transform: translate(0,0);};
}
@-webkit-keyframes bounce {
    0%,20% {-webkit-transform: translate(0,0);}
    50% {-webkit-transform: translate(0,-30px);}
    80%, 100% {-webkit-transform: translate(0,0);};
}