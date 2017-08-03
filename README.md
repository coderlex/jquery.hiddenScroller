# jquery.hiddenScroller

The plugin provides the ability to scroll content of a block by swiping it left or right. It's primarly intended to use in couple with [$.tabs](http://github.com/coderlex/jquery.tabs) to make it behave similarly to native widgets on Android devices.

## Installation

With Bower:
```bash
$ bower install --save jquery.hiddenScroller
```

Or NPM:
```bash
$ npm install --save jquery.hiddenScroller
```

## Dependecies

The package depends on [HammerJS](https://hammerjs.github.io/) and [jQuery](https://jquery.com/). They must be included in the page before `jquery.hiddenScroller`.

## Usage

```html
<nav class="tabs">
	<ul>
		<li class="current"><a href="#tab1">Tab 1</a></li>
		<li><a href="#tab2">Tab 2</a></li>
		<li><a href="#tab3">Tab 3</a></li>
		<li><a href="#tab4">Tab 4</a></li>
		<li><a href="#tab5">Tab 5</a></li>
	</ul>
</nav>
```

```javascript
jQuery(function($) {
	// Disable drag-and-drop
	$('.tabs a')
		.mousedown(function(e) {
			e.preventDefault();
		});
	// The values below are default ones
	$('.tabs').hiddenScroller({
		wrapContent: false,
		swipeInertia: 0.005,
		inertialExtent: 80
	});
});
```