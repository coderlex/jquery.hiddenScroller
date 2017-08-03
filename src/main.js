/**
 * $.hiddenScroller() plugin
 *
 * @author Alexander Korostin <coderlex@gmail.com>
 */
(function($) {
	'use strict'

	// Adding some easing functions
	$.extend($.easing, {
		easeOutQuint: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		}
	});

	var DEFAULTS = {
		wrapContent: false,
		swipeInertia: 0.005,
		inertialExtent: 80
	};

	var HiddenScroller = function($host, options) {
		this.$host = $host;
		this.options = $.extend({}, DEFAULTS, options);
		this.startedPan = false;
	}

	$.extend(HiddenScroller.prototype, {
		init: function() {
			if (this.options.wrapContent) {
				this.$wrapper = $('<div/>');
				this.$host.children().remove().appendTo(this.$wrapper)
				this.$wrapper.appendTo($host)
			} else {
				this.$wrapper = this.$host.children();
			}

			this.$host.css({
				overflow: 'hidden'
			});
			this.$wrapper.css({
				position: 'relative',
				left: '0px'
			});

			this.relayout();

			$(window).resize($.proxy(this.relayout, this));

			var hammer = new Hammer(this.$host[0]);

			hammer.on('panstart', $.proxy(function(e) {
				if (this.options.swipeInertia) {
					// stop swipe inertia animation
					this.$wrapper.stop(true);
				}
				this.startScrollX = this.getScrollX();
				this.startedPan = true;
			}, this));

			hammer.on('panleft panright', $.proxy(function(e) {
				if (this.startedPan) {
					var scrollX = this.clampScrollX(this.startScrollX - e.deltaX);
					this.setScrollX(scrollX);
				}
			}, this));
			hammer.on('panend pancancel', $.proxy(function(e) {
				this.startedPan = false;

				// Add swipe inertia
				if (this.options.swipeInertia && e.velocityX != 0) {
					this.$wrapper.queue($.proxy(function(next, hooks) {
						var dt = 20;
						var t0 = $.now();
						var v0 = -e.velocityX/*0.5*/;
						var x0 = this.getScrollX();
						var a = (v0 > 0 ? -1 : 1) * this.options.swipeInertia;
						
						var interval = setInterval($.proxy(function() {
							var t = $.now() - t0;
							var v = v0 + a*t;
							if ((v <= 0 && v0 > 0) || (v >= 0 && v0 < 0)) {
								clearInterval(interval);
								next();
								// Correct position if out of bound
								this.relayout();
								return;
							}
							var minScrollX = 0;
							var maxScrollX = this.getMaxScrollX();
							if (this.options.inertialExtent) {
								minScrollX -= this.options.inertialExtent;
								maxScrollX += this.options.inertialExtent;
							}
							var x = Math.round(x0 + v0*t + a*t*t/2);
							if (x >= minScrollX && x <= maxScrollX) {
								this.setScrollX(x);
							} else {
								if (x > maxScrollX) {
									this.setScrollX(maxScrollX);
								} else if (x < minScrollX) {
									this.setScrollX(minScrollX);
								}
								// Stop as it reached the end
								clearInterval(interval);
								next();
								// Correct position if out of bound
								this.relayout();
							}
						}, this), dt);

						hooks.stop = function() {
							clearInterval(interval);
						};
					}, this));
				}

				if (this.options.inertialExtent) {
					this.relayout();
				}
			}, this));
		},
		/**
		 * Clamps scroll offset to [-inertialExtent, maxScrollX + intertialExtent]
		 */
		clampScrollX: function(scrollX) {
			// prepare limits scrollX will clamp to
			var minScrollX = 0;
			var maxScrollX = this.getMaxScrollX();
			if (this.options.inertialExtent) {
				minScrollX -= this.options.inertialExtent;
				maxScrollX += this.options.inertialExtent;
			}
			// clamp to [minScrolX, maxScrollX]
			scrollX = Math.max(minScrollX, scrollX);
			scrollX = Math.min(maxScrollX, scrollX);
			return scrollX;
		},
		getMaxScrollX: function() {
			return Math.max(this.getOverflowSpaceX(), 0);
		},
		getScrollX: function() {
			return -parseInt(this.$wrapper.css('left'));
		},
		setScrollX: function(x) {
			this.$wrapper.css('left', -x + 'px');
		},
		scrollToX: function(x, options) {
			options = $.extend({}, {
				animate: true,
				enqueue: false,
				duration: 100
			}, options);

			this.$wrapper.stop(!options.enqueue);
			var css = { left: -x + 'px' };
			if (options.animate) {
				this.$wrapper.animate(css, options.duration);
			} else {
				this.$wrapper.css(css);
			}
		},
		getOverflowSpaceX: function() {
			return this.$wrapper.outerWidth(true) - this.$host.width();
		},
		relayout: function() {
			// Correct scroller position if it got out of bounds
			var freeSpaceLeft = -this.getScrollX();
			var freeSpaceRight = this.getScrollX() - this.getOverflowSpaceX();
			if (freeSpaceLeft > 0) {
				this.scrollToX(0, {duration: 250});
			} else if (freeSpaceRight > 0) {
				this.scrollToX(this.getMaxScrollX(), {duration: 250});
			}
		}
	});

	$.fn.hiddenScroller = function(options) {
		return this.each(function() {
			var $host = $(this);
			if (!$host.data('__hidden-scroller')) {
				var scroller = new HiddenScroller($host, options);
				scroller.init();
				$host.data('__hidden-scroller', scroller);
			}
		});
	};
})(jQuery);