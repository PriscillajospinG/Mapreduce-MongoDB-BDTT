"""
Visualization Script for MongoDB Climate Analysis
Creates charts and graphs from MapReduce results
"""
import os
import sys
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import REPORTS_DIR, CHARTS_DIR


class DataVisualizer:
    """Handles visualization of MapReduce results"""
    
    def __init__(self):
        """Initialize visualizer"""
        # Set style
        sns.set_style("whitegrid")
        plt.rcParams['figure.figsize'] = (12, 6)
        
        # Ensure output directories exist
        os.makedirs(CHARTS_DIR, exist_ok=True)
        
        print(f"✓ Visualizer initialized. Charts will be saved to: {CHARTS_DIR}")
    
    def load_results(self, filename):
        """Load MapReduce results from JSON file"""
        filepath = os.path.join(REPORTS_DIR, filename)
        
        if not os.path.exists(filepath):
            print(f"✗ File not found: {filepath}")
            return None
        
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        return data
    
    def visualize_avg_temp_by_country(self):
        """Create bar chart of average temperature by country"""
        print("\n" + "="*60)
        print("Visualization #1: Average Temperature by Country")
        print("="*60)
        
        data = self.load_results("avg_temp_by_country.json")
        if not data:
            return
        
        # Prepare data
        countries = [d['key'] for d in data[:20]]
        temps = [d['value']['average'] for d in data[:20]]
        
        # Create matplotlib figure
        fig, ax = plt.subplots(figsize=(14, 8))
        colors = plt.cm.RdYlBu_r([temp/max(temps) for temp in temps])
        
        bars = ax.barh(countries, temps, color=colors)
        ax.set_xlabel('Average Temperature (°C)', fontsize=12, fontweight='bold')
        ax.set_ylabel('Country', fontsize=12, fontweight='bold')
        ax.set_title('Top 20 Countries by Average Temperature', fontsize=14, fontweight='bold', pad=20)
        ax.invert_yaxis()
        
        # Add value labels
        for i, (bar, temp) in enumerate(zip(bars, temps)):
            ax.text(temp + 0.5, i, f'{temp:.1f}°C', va='center', fontsize=9)
        
        plt.tight_layout()
        filepath = os.path.join(CHARTS_DIR, 'avg_temp_by_country.png')
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✓ Chart saved: avg_temp_by_country.png")
        
        # Create interactive Plotly version
        fig = go.Figure(data=[
            go.Bar(
                y=countries,
                x=temps,
                orientation='h',
                marker=dict(
                    color=temps,
                    colorscale='RdYlBu_r',
                    showscale=True,
                    colorbar=dict(title="Temperature (°C)")
                ),
                text=[f'{t:.1f}°C' for t in temps],
                textposition='outside'
            )
        ])
        
        fig.update_layout(
            title='Top 20 Countries by Average Temperature',
            xaxis_title='Average Temperature (°C)',
            yaxis_title='Country',
            height=700,
            yaxis={'categoryorder': 'total ascending'}
        )
        
        filepath = os.path.join(CHARTS_DIR, 'avg_temp_by_country_interactive.html')
        fig.write_html(filepath)
        print(f"✓ Interactive chart saved: avg_temp_by_country_interactive.html")
    
    def visualize_temp_trend_by_year(self):
        """Create line chart of temperature trend over years"""
        print("\n" + "="*60)
        print("Visualization #2: Global Temperature Trend")
        print("="*60)
        
        data = self.load_results("temp_trend_by_year.json")
        if not data:
            return
        
        # Prepare data
        years = [d['key'] for d in data]
        temps = [d['value']['average'] for d in data]
        
        # Create matplotlib figure
        fig, ax = plt.subplots(figsize=(16, 8))
        ax.plot(years, temps, linewidth=2, color='#2E86AB', alpha=0.8)
        
        # Add trend line
        z = np.polyfit(years, temps, 1)
        p = np.poly1d(z)
        ax.plot(years, p(years), "--", color='#A23B72', linewidth=2, label=f'Trend: {z[0]:.4f}°C/year')
        
        ax.set_xlabel('Year', fontsize=12, fontweight='bold')
        ax.set_ylabel('Average Temperature (°C)', fontsize=12, fontweight='bold')
        ax.set_title('Global Temperature Trend Over Time', fontsize=14, fontweight='bold', pad=20)
        ax.legend(fontsize=11)
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        filepath = os.path.join(CHARTS_DIR, 'temp_trend_by_year.png')
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✓ Chart saved: temp_trend_by_year.png")
        
        # Create interactive Plotly version
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=years,
            y=temps,
            mode='lines',
            name='Temperature',
            line=dict(color='#2E86AB', width=2)
        ))
        
        # Add trend line
        import numpy as np
        z = np.polyfit(years, temps, 1)
        p = np.poly1d(z)
        
        fig.add_trace(go.Scatter(
            x=years,
            y=p(years),
            mode='lines',
            name=f'Trend: {z[0]:.4f}°C/year',
            line=dict(color='#A23B72', width=2, dash='dash')
        ))
        
        fig.update_layout(
            title='Global Temperature Trend Over Time',
            xaxis_title='Year',
            yaxis_title='Average Temperature (°C)',
            height=600,
            hovermode='x unified'
        )
        
        filepath = os.path.join(CHARTS_DIR, 'temp_trend_by_year_interactive.html')
        fig.write_html(filepath)
        print(f"✓ Interactive chart saved: temp_trend_by_year_interactive.html")
    
    def visualize_seasonal_temps(self):
        """Create chart of seasonal temperature patterns"""
        print("\n" + "="*60)
        print("Visualization #3: Seasonal Temperature Patterns")
        print("="*60)
        
        data = self.load_results("seasonal_temps.json")
        if not data:
            return
        
        # Prepare data
        season_order = ["Winter", "Spring", "Summer", "Fall"]
        season_data = {d['key']: d['value'] for d in data}
        seasons = season_order
        temps = [season_data[s]['average'] for s in season_order if s in season_data]
        counts = [season_data[s]['count'] for s in season_order if s in season_data]
        
        # Create matplotlib figure with subplots
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
        
        # Temperature bar chart
        colors = ['#A8DADC', '#457B9D', '#E63946', '#F4A261']
        bars = ax1.bar(seasons, temps, color=colors, edgecolor='black', linewidth=1.5)
        ax1.set_ylabel('Average Temperature (°C)', fontsize=12, fontweight='bold')
        ax1.set_title('Average Temperature by Season', fontsize=13, fontweight='bold')
        ax1.grid(axis='y', alpha=0.3)
        
        # Add value labels
        for bar, temp in zip(bars, temps):
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height,
                    f'{temp:.1f}°C', ha='center', va='bottom', fontsize=10, fontweight='bold')
        
        # Record count pie chart
        ax2.pie(counts, labels=seasons, autopct='%1.1f%%', colors=colors,
                startangle=90, textprops={'fontsize': 11, 'fontweight': 'bold'})
        ax2.set_title('Record Distribution by Season', fontsize=13, fontweight='bold')
        
        plt.tight_layout()
        filepath = os.path.join(CHARTS_DIR, 'seasonal_temps.png')
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✓ Chart saved: seasonal_temps.png")
        
        # Create interactive Plotly version
        fig = make_subplots(
            rows=1, cols=2,
            subplot_titles=('Average Temperature by Season', 'Record Distribution'),
            specs=[[{"type": "bar"}, {"type": "pie"}]]
        )
        
        fig.add_trace(
            go.Bar(x=seasons, y=temps, marker_color=colors, text=[f'{t:.1f}°C' for t in temps],
                   textposition='outside', showlegend=False),
            row=1, col=1
        )
        
        fig.add_trace(
            go.Pie(labels=seasons, values=counts, marker_colors=colors),
            row=1, col=2
        )
        
        fig.update_layout(height=500, showlegend=True)
        fig.update_xaxes(title_text="Season", row=1, col=1)
        fig.update_yaxes(title_text="Temperature (°C)", row=1, col=1)
        
        filepath = os.path.join(CHARTS_DIR, 'seasonal_temps_interactive.html')
        fig.write_html(filepath)
        print(f"✓ Interactive chart saved: seasonal_temps_interactive.html")
    
    def visualize_city_rankings(self):
        """Create visualization of city temperature rankings"""
        print("\n" + "="*60)
        print("Visualization #4: City Temperature Rankings")
        print("="*60)
        
        warmest_data = self.load_results("city_temp_ranking_warmest.json")
        coldest_data = self.load_results("city_temp_ranking_coldest.json")
        
        if not warmest_data or not coldest_data:
            return
        
        # Prepare data
        warmest_cities = [d['key'] for d in warmest_data[:10]]
        warmest_temps = [d['value']['average'] for d in warmest_data[:10]]
        
        coldest_cities = [d['key'] for d in coldest_data[:10]]
        coldest_temps = [d['value']['average'] for d in coldest_data[:10]]
        
        # Create matplotlib figure
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(18, 8))
        
        # Warmest cities
        bars1 = ax1.barh(range(len(warmest_cities)), warmest_temps, color='#E63946')
        ax1.set_yticks(range(len(warmest_cities)))
        ax1.set_yticklabels(warmest_cities, fontsize=9)
        ax1.set_xlabel('Average Temperature (°C)', fontsize=11, fontweight='bold')
        ax1.set_title('Top 10 Warmest Cities', fontsize=13, fontweight='bold', color='#E63946')
        ax1.invert_yaxis()
        
        for i, temp in enumerate(warmest_temps):
            ax1.text(temp + 0.3, i, f'{temp:.1f}°C', va='center', fontsize=9)
        
        # Coldest cities
        bars2 = ax2.barh(range(len(coldest_cities)), coldest_temps, color='#457B9D')
        ax2.set_yticks(range(len(coldest_cities)))
        ax2.set_yticklabels(coldest_cities, fontsize=9)
        ax2.set_xlabel('Average Temperature (°C)', fontsize=11, fontweight='bold')
        ax2.set_title('Top 10 Coldest Cities', fontsize=13, fontweight='bold', color='#457B9D')
        ax2.invert_yaxis()
        
        for i, temp in enumerate(coldest_temps):
            ax2.text(temp + 0.3, i, f'{temp:.1f}°C', va='center', fontsize=9)
        
        plt.tight_layout()
        filepath = os.path.join(CHARTS_DIR, 'city_rankings.png')
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✓ Chart saved: city_rankings.png")
    
    def visualize_decade_analysis(self):
        """Create visualization of decade-wise temperature analysis"""
        print("\n" + "="*60)
        print("Visualization #5: Decade-wise Temperature Analysis")
        print("="*60)
        
        data = self.load_results("decade_analysis.json")
        if not data:
            return
        
        # Prepare data
        decades = [f"{d['key']}s" for d in data]
        avg_temps = [d['value']['average'] for d in data]
        min_temps = [d['value']['min'] for d in data]
        max_temps = [d['value']['max'] for d in data]
        
        # Create matplotlib figure
        fig, ax = plt.subplots(figsize=(16, 8))
        
        x = range(len(decades))
        
        # Plot lines
        ax.plot(x, avg_temps, marker='o', linewidth=2.5, markersize=8, 
                label='Average', color='#2E86AB')
        ax.fill_between(x, min_temps, max_temps, alpha=0.2, color='#2E86AB', 
                        label='Min-Max Range')
        
        ax.set_xticks(x)
        ax.set_xticklabels(decades, rotation=45, ha='right')
        ax.set_xlabel('Decade', fontsize=12, fontweight='bold')
        ax.set_ylabel('Temperature (°C)', fontsize=12, fontweight='bold')
        ax.set_title('Temperature Trends by Decade', fontsize=14, fontweight='bold', pad=20)
        ax.legend(fontsize=11)
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        filepath = os.path.join(CHARTS_DIR, 'decade_analysis.png')
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✓ Chart saved: decade_analysis.png")
        
        # Create interactive Plotly version
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=decades, y=max_temps,
            mode='lines',
            name='Maximum',
            line=dict(width=0),
            showlegend=False
        ))
        
        fig.add_trace(go.Scatter(
            x=decades, y=min_temps,
            mode='lines',
            name='Min-Max Range',
            fill='tonexty',
            line=dict(width=0),
            fillcolor='rgba(46, 134, 171, 0.2)'
        ))
        
        fig.add_trace(go.Scatter(
            x=decades, y=avg_temps,
            mode='lines+markers',
            name='Average Temperature',
            line=dict(color='#2E86AB', width=3),
            marker=dict(size=8)
        ))
        
        fig.update_layout(
            title='Temperature Trends by Decade',
            xaxis_title='Decade',
            yaxis_title='Temperature (°C)',
            height=600,
            hovermode='x unified'
        )
        
        filepath = os.path.join(CHARTS_DIR, 'decade_analysis_interactive.html')
        fig.write_html(filepath)
        print(f"✓ Interactive chart saved: decade_analysis_interactive.html")
    
    def create_summary_dashboard(self):
        """Create a summary dashboard with key insights"""
        print("\n" + "="*60)
        print("Visualization #6: Summary Dashboard")
        print("="*60)
        
        # Load all data
        country_data = self.load_results("avg_temp_by_country.json")
        trend_data = self.load_results("temp_trend_by_year.json")
        seasonal_data = self.load_results("seasonal_temps.json")
        
        if not all([country_data, trend_data, seasonal_data]):
            print("✗ Missing required data files")
            return
        
        # Create summary statistics
        summary = {
            'total_countries': len(country_data),
            'warmest_country': country_data[0]['key'],
            'warmest_temp': country_data[0]['value']['average'],
            'coldest_country': country_data[-1]['key'],
            'coldest_temp': country_data[-1]['value']['average'],
            'total_years': len(trend_data),
            'first_year': trend_data[0]['key'],
            'last_year': trend_data[-1]['key'],
            'temp_increase': trend_data[-1]['value']['average'] - trend_data[0]['value']['average']
        }
        
        # Save summary to JSON
        filepath = os.path.join(REPORTS_DIR, 'summary_statistics.json')
        with open(filepath, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"✓ Summary statistics saved: summary_statistics.json")
        print(f"\nKey Insights:")
        print(f"  • Total countries analyzed: {summary['total_countries']}")
        print(f"  • Warmest country: {summary['warmest_country']} ({summary['warmest_temp']:.1f}°C)")
        print(f"  • Coldest country: {summary['coldest_country']} ({summary['coldest_temp']:.1f}°C)")
        print(f"  • Time period: {summary['first_year']} - {summary['last_year']}")
        print(f"  • Temperature increase: {summary['temp_increase']:.2f}°C over {summary['total_years']} years")
    
    def generate_all_visualizations(self):
        """Generate all visualizations"""
        print("\n" + "="*60)
        print("DATA VISUALIZATION - CLIMATE ANALYSIS PROJECT")
        print("="*60)
        
        try:
            self.visualize_avg_temp_by_country()
            self.visualize_temp_trend_by_year()
            self.visualize_seasonal_temps()
            self.visualize_city_rankings()
            self.visualize_decade_analysis()
            self.create_summary_dashboard()
            
            print("\n" + "="*60)
            print("✓ ALL VISUALIZATIONS GENERATED SUCCESSFULLY!")
            print(f"Charts saved to: {CHARTS_DIR}")
            print("="*60 + "\n")
            
        except Exception as e:
            print(f"\n✗ Error during visualization: {e}")
            import traceback
            traceback.print_exc()


def main():
    """Main execution function"""
    import numpy as np  # Import here for trend line calculations
    
    visualizer = DataVisualizer()
    
    try:
        visualizer.generate_all_visualizations()
        return 0
    except KeyboardInterrupt:
        print("\n\n✗ Visualization interrupted by user")
        return 1


if __name__ == "__main__":
    sys.exit(main())
