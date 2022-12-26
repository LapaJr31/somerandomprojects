import random
import math

# Встановлюємо параметр експоненційного розподілу
lambda_param = 2

# Генеруємо 5000 випадкових значень з експоненційного розподілу
values = []
for _ in range(5000):
    u = random.random()  # Генеруємо випадкове число від 0 до 1
    x = -1 / lambda_param * math.log(1 - u)  # Обраховуємо значення за формулою
    values.append(x)

# Обчислюємо експериментальне математичне очікування
exp_mean = sum(values) / len(values)

# Обчислюємо середнє квадратичне відхилення
rmsd = math.sqrt(sum((x - exp_mean) ** 2 for x in values) / len(values))

# Обчислюємо теоретичне математичне очікування
theor_mean = 1 / lambda_param

# Виводимо експериментальні та теоретичні значення
print("Експериментальне середнє: ", exp_mean)
print("Теоретичне середнє: ", theor_mean)
print("Середнє квадратичне відхилення: ", rmsd)
