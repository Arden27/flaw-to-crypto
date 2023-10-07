from django.shortcuts import render
import requests
from datetime import datetime, timedelta

def get_historical_bitcoin_price(days="max"):
    url = f"https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days={days}"
    response = requests.get(url)
    data = response.json()
    prices = data['prices']

    # Convert the timestamp to dates and check if the last two are the same
    last_date = datetime.fromtimestamp(prices[-1][0] / 1000).date()
    second_last_date = datetime.fromtimestamp(prices[-2][0] / 1000).date()

    if last_date == second_last_date:
        prices.pop(-2)  # Remove the second to last item

    # Check for consecutive duplicates and date gaps
    new_prices = []
    prev_date = None
    for i in range(len(prices) - 1, -1, -1):
        curr_date = datetime.fromtimestamp(prices[i][0] / 1000).date()
        curr_price = prices[i][1]

        #some old data might have gaps, finding them and filling out with avarage price
        if prev_date and curr_date < prev_date - timedelta(days=1):
            # Compute average price and fill in the gap
            gap_days = (prev_date - curr_date).days
            prev_price = prices[i + 1][1]

            for gap_day in range(1, gap_days):
                gap_date = datetime.combine(curr_date + timedelta(days=gap_day), datetime.min.time())
                gap_price = curr_price + (gap_day / gap_days) * (prev_price - curr_price)
                new_prices.append([int(gap_date.timestamp() * 1000), gap_price])
                print(f"Filled gap from {curr_date} to {prev_date} with date {gap_date.date()} and price {gap_price}")

        new_prices.append(prices[i])
        prev_date = curr_date

    new_prices.reverse()  # Reverse the list to keep the original order

    # # Write the prices to a text file
    # with open('bitcoin_prices.txt', 'w') as f:
    #     for price in new_prices:
    #         date = datetime.fromtimestamp(price[0] / 1000).date()
    #         f.write(f"{date}: ${price[1]}\n")

    return new_prices



def home(request):
    prices = get_historical_bitcoin_price()
    context = {
        'prices': prices,
    }
    return render(request, 'flawtocrypto/index.html', context)