// Ensure the DOM is fully loaded before executing the script
document.addEventListener("DOMContentLoaded", () => {
    // Utilize jQuery's ready method to execute the function once the DOM is ready
    $(function() {
        // Initial slider values and price configurations
        let min = 0;
        let max = prices.length - 1;
        let currentPrice = prices[max][1];
        let priceMin = 0;
        let priceMax = currentPrice * 10;
        let selectedPrice = currentPrice;

        // Function to calculate and display the total investment result based on user input and slider positions
        function calculateTotalInvestment(sliderValue, priceForCalculation) {
            let dailyInvestment = $("#dailyInvestment").val();
            if (dailyInvestment && sliderValue !== max) {
                let totalBitcoin = 0;
                let investmentDays = max - sliderValue + 1;
                for (let i = sliderValue; i <= max; i++) {
                    let priceData = prices[i];
                    let price = priceData[1];
                    let bitcoinPurchased = dailyInvestment / price;
                    totalBitcoin += bitcoinPurchased;
                }
                let totalValue = totalBitcoin * priceForCalculation;
                let initialInvestment = dailyInvestment * investmentDays;

                // Update the investment details text
                $("#dailyInvestment").next().html(`/day for <span class="text1">${investmentDays}</span> days <span class="text2">($${initialInvestment}</span> total), you'd now have <span class="text3">${totalBitcoin.toFixed(8)} BTC</span> worth <span class="text4">$${totalValue.toFixed(2)}</span> at current rate <span class="text5">$${selectedPrice.toFixed(2)}</span>.`);
            }
        }

        // Configure the date slider
        $("#slider").slider({
            range: "max",
            min: min,
            max: max,
            value: max,
            slide: function(event, ui) {
                let currentPriceData = prices[ui.value];
                let timestamp = currentPriceData[0] / 1000;
                let date = new Date(timestamp * 1000).toISOString().split('T')[0];
                let currentPrice = prices[ui.value][1];
                $(this).find(".date-slider-text").html(`${date}`);
                $(this).find(".past-price-slider-text").html(`$${currentPrice.toFixed(2)}`);
                calculateTotalInvestment(ui.value, selectedPrice);
            },
            create: function() {
                let handle = $(this).find(".ui-slider-handle");
                handle.append('<span class="date-slider-text"></span>');
                handle.append('<span class="past-price-slider-text"></span>');
            }
        });

        // Flag to track whether the price slider is being dragged
        let draggingPriceSlider = false;

        // Configure the price slider
        $("#priceSlider").slider({
            orientation: "vertical",
            range: "max",
            min: priceMin,
            max: priceMax,
            value: currentPrice,
            slide: function(event, ui) {
                selectedPrice = ui.value;
                $(this).find(".price-slider-text").text(`$${selectedPrice.toFixed(2)}`);
                $(".price-slider-text").show();
                calculateTotalInvestment($("#slider").slider("value"), selectedPrice);
            },
            create: function() {
                let handle = $(this).find(".ui-slider-handle");
                handle.append('<span class="price-slider-text">$' + $(this).slider('value').toFixed(2) + '</span>');
                $(".price-slider-text").hide();
            },
            start: function(event, ui) {
                draggingPriceSlider = true; // Update flag when dragging starts
            },
            stop: function(event, ui) {
                draggingPriceSlider = false; // Update flag when dragging stops
                if (!$("#priceSlider").is(":hover")) {
                    $(".price-slider-text").fadeOut();
                }
            }
        });

        // Show price slider text when mouse is over the price slider
        $(".price-slider-container").mouseenter(function() {
            $(this).find(".price-slider-text").stop().fadeIn();
        });

        // Hide price slider text when mouse leaves the price slider
        $(".price-slider-container").mouseleave(function() {
            if (!draggingPriceSlider) {
                $(this).find(".price-slider-text").stop().fadeOut();
            }
        });

        // Update investment calculation and text whenever the daily investment input changes
        $("#dailyInvestment").on("input", function() {
            let newWidth = $(this).val().length > 1 ? $(this).val().length * 12 + 'px' : '12px';
            $(this).css('width', newWidth);
            calculateTotalInvestment($("#slider").slider("value"), selectedPrice);

            // Update the text based on whether there's input
            if ($(this).val().length > 0 && $("#slider").slider("value") === max) {
                $("#investmentPeriod").fadeOut(function() {
                    $(this).text("/day. Now use slider.").fadeIn();
                });
            } else if ($(this).val().length === 0) {
                $("#investmentPeriod").fadeOut(function() {
                    $(this).text("per day").fadeIn(); // Reset the text when the input field is empty
                });
            } else {
                calculateTotalInvestment($("#slider").slider("value"), selectedPrice);
            }
        });

        // Reset the price slider and update the investment calculation when the reset button is clicked
        $("#resetPrice").on("click", function() {
            $("#priceSlider").slider("value", currentPrice);
            selectedPrice = currentPrice;
            calculateTotalInvestment($("#slider").slider("value"), selectedPrice);
            $("#priceSlider").find(".price-slider-text").text(`$${currentPrice.toFixed(2)}`);
        });

        // Trigger the slide event to display the initial price
        $("#slider").slider("value", max);

        // Create the chart data arrays
        let chartLabels = prices.map(item => new Date(item[0]).toISOString().split('T')[0]);
        let chartData = prices.map(item => item[1]);

        // Create the Bitcoin price chart
        let ctx = document.getElementById('bitcoinChart').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Bitcoin Price',
                    data: chartData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
});
