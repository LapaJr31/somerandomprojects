import numpy as np

# Генеруємо вибірку з третьої ступеневої рівномірної розподільної функції
a = -1  # мінімальне значення
b = 1   # максимальне значення
samples = np.random.uniform(a, b, 1000) # генеруємо 1000 випадкових значень

# Гістограма вибірки
bins = 50

bin_edges = np.linspace(a, b, bins + 1)

# Рахуємо кількість елементів для кожної коробки
bin_counts, _ = np.histogram(samples, bin_edges)

# Виводимо гістограму
for i in range(bins):
    print(f'[{bin_edges[i]:.2f}, {bin_edges[i+1]:.2f}]: {"*" * bin_counts[i]}')
